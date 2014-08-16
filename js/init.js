/**
 * @file js/init.js
 * Copyright (c) 2014, Fela Maslen
 */

define([
    "jquery",
    "jquerycookie",

    "global",
    "game"
  ],
  function(
    $,
    jquerycookie,
    
    global,
    Game
  ) {
    global.game = new Game();

    $(document).ready(function(){
      global.debug("triggering doc_ready_pre", 2);
      $(window).trigger("doc_ready_pre");
      
      global.debug("triggering doc_ready_post", 2);
      $(window).trigger("doc_ready_post");

      return true;
    });
  }
);
