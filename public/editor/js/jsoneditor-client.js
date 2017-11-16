(function(exports, $) {

  var container = document.getElementById('jsoneditor');

  var options = {
    mode: 'code',
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

  var JsonEditorClient = exports.JsonEditorClient = function(params) {
    var self = this;
    params = params || {};

    self.loadConfigList = function() {
      var listAction = params.listAction;
      $.getJSON(listAction.path, {}).done(function( agents ) {
        $('#jsoneditorTextList').append('<option value="__NULL__">(choose a document)</option>');
        agents = agents || [];
        agents.forEach(function(agent) {
          agent = agent || {};
          $('#jsoneditorTextList').append('<option value="' + agent.name + '">' + agent.description + '</option>');
        })
      }).fail(function(error) {
        console.log( "error: " + JSON.stringify(error));
      });

      $('#jsoneditorTextList').change(function() {
        self.loadJsonDocument($(this).val());
      });
    };

    self.loadJsonDocument = function(id) {
      if (id == '__NULL__') return;
      $.getJSON(substitute(params.loadAction.path, {
        "%DOCUMENT_ID%": id
      }), {}).done(function( jsonContent ) {
        editor.set(jsonContent);
      });
    }
  };

  function substitute(str, data) {
    var output = str.replace(/%[^%]+%/g, function(match) {
        if (match in data) {
            return(data[match]);
        } else {
            return("");
        }
    });
    return(output);
  }
})(this, jQuery);
