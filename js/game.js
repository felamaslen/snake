/**
 * @file js/game.js
 */

define([
    "jquery",
    "jquerycookie",

    "global",
    "view"
  ],
  function(
    $,
    jquerycookie,
    global,
    view
  ) {
   
    function getMove(dir) {
      var x = dir % 2 > 0 ? (dir === 1 ? 1 : -1) : 0,
          y = dir % 2 < 1 ? (dir === 0 ? -1 : 1) : 0;

      return { x: x, y: y };
    }

    var Game = function() {
      this.state = null;
      this.$canvas = $("<canvas></canvas>");
      this.ctx = this.$canvas[0].getContext("2d");
      
      $("#viewGame").append(this.$canvas);

      return true;
    }

    Game.prototype.init = function(param) {
      if (this.state !== null) {
        global.debug("Tried to initialise a game when one was already started!", 1);
        return false;
      }
      
      global.debug("Initialising game...", 2);

      this.param = $.extend(true, {
        resolution: 10
      }, param);

      this.state = {
        snake: this.getStartSnake(),
        food: [],
        speed: 1 // units per second
      };

      //this.dropFood();

      // initialise canvas
      this.initCanvas();

      view.change("viewGame");

      // initialise animation
      this.distAccum = 0;
      this.animCount = 0;
      this.anim = window.setTimeout(function() {
        this.animate();
      }.bind(this), global.animTime);

      return true;
    }

    Game.prototype.destroy = function(msg) {
      if (typeof msg !== "undefined") {
        global.debug(msg, 0);
      }

      if (this.anim !== null) {
        window.clearTimeout(this.anim);
        this.anim = null;
      }

      this.state = null;

      view.change("viewControl");
      
      return true;
    }

    Game.prototype.lose = function() {
      this.destroy();
      global.debug("You lost!", 0);
      return true;
    }

    Game.prototype.animate = function() {
      // called every time the frame updates (i.e. very often)

      // decide whether or not to move the snake
      this.distAccum += this.state.speed * global.animTime / 1000;
      if (this.distAccum > 1) {
        var dist = Math.floor(this.distAccum);
        this.distAccum -= dist;

        for (var i = 0; i < dist; i++) {
          for (var j = this.state.snake.length - 1; j >= 0; j--) {
            // follow the next one
            if (j === 0) {
              var newDir = this.state.snake[0].dir;
            }
            else {
              // calculate the new direction of this unit based on the direction of the next unit along
              var a = this.state.snake[j],
                  b = this.state.snake[j-1];

              var newDir = a.x === b.x ? (a.y > b.y ? 0 : 2) : (a.x < b.x ? 1 : 3);
            }
            
            var move = getMove(newDir);

            this.state.snake[j].x += move.x;
            this.state.snake[j].y += move.y;
          }
        }
      }
      
      this.redraw();

      // continue the animation
      this.animCount++;
      this.anim = window.setTimeout(function() {
        this.animate();
      }.bind(this), global.animTime);

      return true;
    };

    Game.prototype.initCanvas = function() {
      this.winDim = null;
      this.handleResize();

      this.redraw();
      
      return true;
    }

    Game.prototype.redraw = function() {
      // draw snake
      this.ctx.clearRect(0, 0, this.winDim, this.winDim);

      this.ctx.fillStyle = "#666"; // tbc

      for (var i = 0; i < this.state.snake.length; i++) {
        this.ctx.beginPath();
        this.ctx.fillRect(
          this.state.snake[i].x * this.cellWidthOuter,
          this.state.snake[i].y * this.cellWidthOuter,
          this.cellWidthOuter - 1,
          this.cellWidthOuter - 1
        );
      }

      return true;
    }

    Game.prototype.getStartSnake = function() {
      // gets a starting snake
      // the first element is the head, and so on
      var snake = [];

      var length  = Math.min(this.param.resolution - 2, global.startSnakeLength),
          // head starting position
          hx      = Math.min(this.param.resolution - 2, Math.round((this.param.resolution + length) / 2) - 1),
          hy      = Math.floor(this.param.resolution / 2),
          dir     = 1 // right
      ;

      for (var i = 0, x = hx; i < length; i++, x--) {
        snake.push({
          dir: dir,
          x: x,
          y: hy
        });
      }
      
      return snake;
    }

    Game.prototype.inSnake = function(x, xOrY) {
      for (var i = 0; i < this.state.snake.length; i++) {
        if ((xOrY && x === this.state.snake[i].x) ||
           (!xOrY && y === this.state.snake[i].y)) return true;
      }
      return false;
    }

    Game.prototype.dropFood = function() {
      // adds food to game

      // get random position for new food
      var x = this.state.snake[0].x,
          y = this.state.snake[0].y;

      while (this.inSnake(x, true))   x = Math.floor(Math.random() * this.resolution);
      while (this.inSnake(y, false))  y = Math.floor(Math.random() * this.resolution);

      this.state.food.push({
        x: x,
        y: y
      });

      return true;
    }

    Game.prototype.handleResize = function() {
      if (this.state === null) return false; // game not started
      
      // get width and height based on window dimensions
      var winDim = Math.min($(window).width(), $(window).height());

      if (winDim === this.winDim) return false; // unchanged
      this.winDim = winDim;

      this.cellWidthOuter = Math.floor(winDim / this.param.resolution);

      this.canvasDim = this.cellWidthOuter * this.param.resolution;

      this.$canvas.attr({
        width: this.canvasDim,
        height: this.canvasDim
      });

      return true;
    }

    var evGameResize = function() {
      if (global.game.handleResize()) {
        global.game.redraw();
      }

      return true;
    };

    Game.prototype.pause = function(unpause) {
      // pause game
      return true;
    }

    // keybindings
    var keys = {
      space: 32,
      enter: 13,
      left: 37,
      up: 38,
      right: 39,
      down: 40
    };

    var evGameKeydown = function(e) {
      if (global.game.state === null) return false;

      switch (e.keyCode) {
        case keys.left:
          if (global.game.state.snake[0].dir % 2 !== 0) return false;

          global.game.state.snake[0].dir = 3;

          break;
        case keys.right:
          if (global.game.state.snake[0].dir % 2 !== 0) return false;

          global.game.state.snake[0].dir = 1;

          break;
        case keys.up:
          if (global.game.state.snake[0].dir % 2 === 0) return false;

          global.game.state.snake[0].dir = 0;

          break;
        case keys.down:
          if (global.game.state.snake[0].dir % 2 === 0) return false;

          global.game.state.snake[0].dir = 2;

          break;

        case keys.space:
          global.game.pause();
          break;
      }
      
      return true;
    }
    
    $(window).on("resize", evGameResize);

    $(window).on("doc_ready_pre", function() {
      $("#inputWidth").val(global.defaultResolution);
    });

    $(window).on("keydown", evGameKeydown);

    return Game;
  }
);
