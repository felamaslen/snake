require.config({
  appDir: ".",
  waitSeconds: 5,
  urlArgs: "bust=" + Math.floor(Math.random() * 999999),

  paths: {
    jquery:       "libs/jquery.min",
    jquerycookie: "libs/jquery.cookie.min",
    
    global: "global",

    view:   "view",

    game:   "game",
    ui:     "ui",
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
    "view",
    "game",
    "ui",
    "init"
  ],
  function(
    $,
    global,
    view,
    Game,
    ui,
    init
  ) {
    $(document).ready(function() {
      window.console && console.log("REQUIRE::Loaded");
    });
  }
);
