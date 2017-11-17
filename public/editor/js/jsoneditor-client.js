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

    var submitAction = params.submitAction || {};
    var submitOptions = submitAction.options || [];
    console.log(submitOptions);
    submitOptions.forEach(function(option) {
      $('#actionButtons').append('<button class="btn btn-default actionButton" type="button" data-toggle="tooltip" title="' + option.description + '" id="' + option.value + '">' + option.label + '</button>');
    });

    var documentId = null;

    $('.actionButton').click(function() {
      var action = $(this).attr('id');
      console.log('Action: %s', action);
      self.saveJsonDocument(documentId, { action: action });
    })

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
        documentId = $(this).val();
        self.loadJsonDocument(documentId);
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

    self.saveJsonDocument = function(id, options) {
      if (id == '__NULL__') return;
      var myData = Object.assign({action: options.action}, editor.get());
      $.ajax({
          type: 'PUT',
          contentType: 'application/json',
          headers: {
              Accept: "application/json"
          },
          dataType: 'json',
          url: substitute(params.submitAction.path, {
            "%DOCUMENT_ID%": id
          }),
          data: JSON.stringify(myData)
      });
    }

    $('[data-toggle="tooltip"]').tooltip();
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
