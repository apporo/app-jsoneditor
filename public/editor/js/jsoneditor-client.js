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

  var json = {};

  var editor = new JSONEditor(container, options, json);

  var ConfigwebClient = exports.ConfigwebClient = function(params) {
    var self = this;
    params = params || {};

    self.loadConfigList = function() {
      console.log('Im here');
      $.getJSON("../rest", {}).done(function( agents ) {
        console.log('Data: ' + JSON.stringify(agents, null, 2));
        agents = agents || [];
        agents.forEach(function(agent) {
          agent = agent || {};
          $('#jsoneditorTextList').append('<option value="' + agent.name + '">' + agent.description + '</option>');
        })
      }).fail(function(error) {
        console.log( "error: " + JSON.stringify(error));
      });

      $('#jsoneditorTextList').change(function() {
        var id = $(this).val();
        $.getJSON("../rest/" + id, {}).done(function( jsonContent ) {
          editor.set(jsonContent);
        });
      });
    };
  };
})(this, jQuery);
