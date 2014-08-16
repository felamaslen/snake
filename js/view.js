/**
 * @file js/view.js
 */

define([
    "jquery"
  ],
  function($) {
    var view = {
      current: null,
      change: function(newView) {
        if (view.current !== null) {
          view.current.addClass("hidden");
        }
        view.current = $("#" + newView);
        view.current.removeClass("hidden");

        return true;
      }
    };

    $(window).on("doc_ready_pre", function() {
      view.change("viewControl");
    });

    return view;
  }
);
