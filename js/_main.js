require.config({
  appDir: ".",
  waitSeconds: 5,
  urlArgs: "bust=" + Math.floor(Math.random() * 999999),

  paths: {
    jquery:       "libs/jquery.min",
    jquerycookie: "libs/jquery.cookie",
    
    global: "global",
    config: "config",

    game:   "game",
    init:   "init"
  },

  shim: {
    "jquery": { exports: "$" },
    "jquerycookie": { deps: ["jquery"], exports: "jquerycookie" }
  }
});

require([
    "jquery",
    "global",
    "game"
  ],
  function(
    $,
    global,
    game
  ) {

    $(document).ready(function() {
      window.console && console.log("REQUIRE::Loaded");
    });
  }
);
