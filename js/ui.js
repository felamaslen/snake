/**
 * @file js/ui.js
 */

define([
    "jquery",
    "jquerycookie",
    "global"
  ],
  function(
    $, jquerycookie,
    global
  ) {

    // handles the form to configure and start the game
    function getParams() {
      var param = {
        resolution: parseInt($("#inputWidth").val()),
        difficulty: parseInt($("#inputDifficulty").val())
      };

      // validate parameters
      if (
        isNaN(param.resolution) || param.resolution < global.minResolution ||
          param.resolution > global.maxResolution
        ||
        isNaN(param.difficulty) || param.difficulty < global.minDifficulty ||
          param.difficulty > global.maxDifficulty
      ) {

        return null;
      }

      return param;
    }

    global.evStartGame = function() {
      global.debug("Clicked start game button", 2);
      var param = getParams();

      if (param === null) {
        global.debug("Please configure the game before starting it!", 0);

        return false;
      }

      global.game.init(param);

      return true;
    }

    $(window).on("doc_ready_pre", function() {
      $("#btnStart").on("click", global.evStartGame);
    });
    
    return true;
  }
);
