(function(exports, $) {

  var container = document.getElementById('jsoneditor');

  var options = {
    mode: 'tree',
    modes: ['code', 'form', 'text', 'tree', 'view'], // allowed modes
    onError: function (err) {
      alert(err.toString());
    },
    onModeChange: function (newMode, oldMode) {
      console.log('Mode switched from', oldMode, 'to', newMode);
    }
  };

  var json = {
    "array": [1, 2, 3],
    "boolean": true,
    "null": null,
    "number": 123,
    "object": {"a": "b", "c": "d"},
    "string": "Hello World"
  };

  var editor = new JSONEditor(container, options, json);

  var ConfigwebClient = exports.ConfigwebClient = function(params) {
    var self = this;
    params = params || {};

    self.loadConfigList = function() {
      $.getJSON("../source", {}).done(function( agents ) {
        console.log(JSON.stringify(agents, null, 2));
      }).fail(function(error) {
        console.log( "error: " + JSON.stringify(error));
      });
    };
  };
})(this, jQuery);
