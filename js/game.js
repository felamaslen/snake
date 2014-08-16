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
    
    function inverseDir(dir) {
      return (dir + 2) % 4;
    }

    function getMove(dir, inverse) {
      if (inverse) dir = inverseDir(dir);

      var x = dir % 2 > 0 ? (dir === 1 ? 1 : -1) : 0,
          y = dir % 2 < 1 ? (dir === 0 ? -1 : 1) : 0;

      return { x: x, y: y };
    }

    var Game = function() {
      this.state = null;
      this.$canvas = $("<canvas></canvas>").attr("id", "gameCanvas");
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

      // initialise canvas
      this.initCanvas();

      this.state = {
        snake: this.getStartSnake(),
        food: [],
        speed: 5, // units per second
        acceptKey: true,

        paused: false,

        score: 0,
        foodCount: 0
      };

      this.dropFood();

      this.redraw();

      //global.debug(this.state.snake, this.state.food, 2);

      view.change("viewGame");

      // initialise animation
      this.distAccum = 0;
      this.animCount = 0;
      this.animTimeout();
      
      return true;
    }

    Game.prototype.destroy = function(msg) {
      if (this.anim !== null) {
        window.clearTimeout(this.anim);
        this.anim = null;
      }
      
      if (typeof msg !== "undefined") {
        global.debug(msg, 0);
      }

      this.state = null;

      view.change("viewControl");
      
      return true;
    }

    Game.prototype.lose = function() {
      this.destroy("You lost!\nScore: " + this.state.score.toFixed(0));
      return true;
    }

    Game.prototype.animate = function() {
      // called every time the frame updates (i.e. very often)
      if (this.state === null) return false;

      if (this.state.paused) {
        this.animTimeout();
        return true;
      }

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

            if (j === 0) {
              // check for collision
              if (this.inSnake({
                x: this.state.snake[0].x,
                y: this.state.snake[0].y
              }, 0) || !this.validUnit(this.state.snake[j])) {
                this.lose();
                return true;
              }

              // check for eating food
              for (var k = 0; k < this.state.food.length; k++) {
                if (this.state.food[k].x === this.state.snake[0].x &&
                    this.state.food[k].y === this.state.snake[0].y
                ) {
                  // eat the food
                  var food = this.state.food.splice(k, 1)[0];
                  
                  this.grow(food);
                  this.state.foodCount++;

                  // add more food to eat
                  this.dropFood();
                }
              }
            }
          }
        }
            
        global.game.state.acceptKey = true;
      }
      
      this.redraw();

      this.animTimeout();

      return true;
    };

    Game.prototype.animTimeout = function() {
      // continue the animation
      this.animCount++;
      this.anim = window.setTimeout(function() {
        this.animate();
      }.bind(this), global.animTime);
    }

    Game.prototype.initCanvas = function() {
      this.winDim = null;
      this.handleResize(true);
      
      return true;
    }

    Game.prototype.redraw = function() {
      // draw snake
      this.ctx.clearRect(0, 0, this.canvasX, this.canvasY);

      // draw snake
      this.ctx.fillStyle = global.color.snake;

      for (var i = 0; i < this.state.snake.length; i++) {
        this.ctx.beginPath();
        this.ctx.fillRect(
          this.state.snake[i].x * this.cellWidthOuter,
          this.state.snake[i].y * this.cellWidthOuter,
          this.cellWidthOuter - 1,
          this.cellWidthOuter - 1
        );
      }

      // draw food
      this.ctx.fillStyle = global.color.food;
      for (var i = 0; i < this.state.food.length; i++) {
        this.ctx.beginPath();
        this.ctx.moveTo(
          (this.state.food[i].x + .5) * this.cellWidthOuter,
          (this.state.food[i].y + .5) * this.cellWidthOuter
        );
        this.ctx.arc(
          (this.state.food[i].x + .5) * this.cellWidthOuter,
          (this.state.food[i].y + .5) * this.cellWidthOuter,
          this.cellWidthOuter / 3,
          0, Math.PI * 2,
          false
        );
        this.ctx.fill();
      }

      return true;
    }

    Game.prototype.getStartSnake = function() {
      // gets a starting snake
      // the first element is the head, and so on
      var snake = [];

      var length  = Math.min(this.resX - 2, global.startSnakeLength),
          // head starting position
          hx      = Math.min(this.resX - 2, Math.round((this.resX + length) / 2) - 1),
          hy      = Math.floor(this.resY / 2),
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

    Game.prototype.inSnake = function(unit, exclude) {
      // detects collisions
      if (typeof exclude === "undefined") exclude = -1;

      for (var i = 0; i < this.state.snake.length; i++) {
        if (i === exclude) continue;
        if (this.state.snake[i].x === unit.x && this.state.snake[i].y === unit.y)
          return true;
      }
        
      return false;
    }

    Game.prototype.validUnit = function(unit) {
      return unit.x >= 0 && unit.y >= 0 && unit.x < this.resX && unit.y < this.resY;
    }

    Game.prototype.grow = function(food) {
      global.debug("Called game.grow()", 3);

      // check for where to add the new dot
      var sl = this.state.snake.length,
          move = getMove(this.state.snake[sl-1].dir, true),
          unit = {
            x: this.state.snake[sl-1].x + move.x,
            y: this.state.snake[sl-1].y + move.y
          };

      var dir = 0, dDir = inverseDir(this.state.snake[sl-1].dir);
      while (!this.validUnit(unit) || this.inSnake(unit)) {
        if (dir === dDir) dir++;
        if (dir > 3) break;

        var move = getMove(dir, false);
        unit = {
          x: this.state.snake[sl-1].x + move.x,
          y: this.state.snake[sl-1].y + move.y
        };

        dir++;
      }

      if (!this.validUnit(unit) || this.inSnake(unit)) {
        this.lose();
        return false;
      }

      unit.dir = dir;

      this.state.snake.push(unit);

      this.state.score += Math.round(food.score[0] * Math.pow(food.score[1], this.state.foodCount));

      this.updateScoreBar();

      return true;
    }
    
    Game.prototype.dropFood = function() {
      // adds food to game

      // get random position for new food
      var x, y;
      
      do {
        x = Math.floor(Math.random() * this.resX);
        y = Math.floor(Math.random() * this.resY);
      } while (this.inSnake({x: x, y: y}));

      this.state.food.push({
        x: x,
        y: y,
        score: [50, 1.07]
      });

      return true;
    }

    Game.prototype.updateScoreBar = function() {
      $("#score").text(this.state.score.toFixed(0));
      return true;
    }

    Game.prototype.handleResize = function(force) {
      if ((typeof force === "undefined" || !force) &&
          this.state === null) return false; // game not started
      
      // get width and height based on window dimensions
      var winW = $(window).width(),
          winH = $(window).height() - global.scoreBarHeight,
          portrait  = winW < winH,
          winDim    = portrait ? winW : winH;

      if (this.winDim !== null && this.winDim[0] === winW && this.winDim[1] === winH)
        return false; // unchanged

      this.winDim = [winW, winH];

      this.cellWidthOuter = Math.floor(winDim / this.param.resolution);

      if (portrait) {
        this.resX = this.param.resolution;
        this.resY = Math.floor(winH / this.cellWidthOuter);
      }
      else {
        this.resY = this.param.resolution;
        this.resX = Math.floor(winW / this.cellWidthOuter);
      }

      this.canvasX = this.cellWidthOuter * this.resX;
      this.canvasY = this.cellWidthOuter * this.resY;

      this.$canvas.attr({
        width: this.canvasX,
        height: this.canvasY
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
      var pause = typeof unpause === "undefined" || !unpause;
      
      this.state.paused = pause;

      $(document.body).toggleClass("paused", pause);

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
      if (global.game.state === null || !global.game.state.acceptKey)
        return true;

      switch (e.keyCode) {
        case keys.left:
          if (global.game.state.snake[0].dir % 2 !== 0) return false;

          global.game.state.snake[0].dir = 3;
          global.game.state.acceptKey = false;

          break;
        case keys.right:
          if (global.game.state.snake[0].dir % 2 !== 0) return false;

          global.game.state.snake[0].dir = 1;
          global.game.state.acceptKey = false;

          break;
        case keys.up:
          if (global.game.state.snake[0].dir % 2 === 0) return false;

          global.game.state.snake[0].dir = 0;
          global.game.state.acceptKey = false;

          break;
        case keys.down:
          if (global.game.state.snake[0].dir % 2 === 0) return false;

          global.game.state.snake[0].dir = 2;
          global.game.state.acceptKey = false;

          break;

        case keys.space:
          global.game.pause(global.game.state.paused);
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
