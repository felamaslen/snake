/**
 * @file js/init.js
 * Copyright (c) 2014, Fela Maslen
 */

define([
    "jquery",
    "jquerycookie",

    "global",
    "config",
    "game"
  ],
  function(
    $,
    jquerycookie,
    
    global,
    config,
    game
  ) {
    global.game = new Game();

    $(document).ready(function(){
      /*
      global.game.init({
        $container: $("#viewGame")
      });
      */
    });

    return true;
  }
);
