/**
 * @file js/global.js
 */

define([
  ],
  function(
  ) {

    var global = {
      debug: function() {
        var args = [];
        for (var i = 0; i < arguments.length - 1; i++) {
          args.push(arguments[i]);
        }
        var level = arguments[arguments.length - 1];

        if (typeof level !== "number") {
          args.push(level);
          level = 3;
        }

        var prefix = "N/A";
        switch (level) {
          case 0: prefix = "FATAL"; break;
          case 1: prefix = "WARN";  break;
          case 2: prefix = "NOTICE"; break;
          case 3: prefix = "DEBUG"; break;
          case 4: prefix = "DEBUG"; break; // debug with trace
        }

        if (level === 0) {
          alert(args.join(","));
        }

        if (typeof window.console != "undefined") {
          if (level >= 4) console.trace();

          args.unshift("[" + prefix + "]");

          console.log.apply(console, args);
        }

        return true;
      },
      
      // game parameters
      minResolution: 5,
      maxResolution: 100,
      defaultResolution: 25,
      startPadding: 4,
      startSnakeLength: 5,

      scoreBarHeight: 32,
      
      minDifficulty: 1,
      maxDifficulty: 10,

      // animation parameters
      animTime: 20, // ms

      // colours
      color: {
        snake: "#666",
        food: "#fa0068"
      }
    };
    
    return global;
  }
); 
