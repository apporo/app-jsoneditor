(function(exports, $) {

  exports.JsonEditorClient = function(params) {
    var self = this;
    params = params || {};

    var documentId = null;
    var container = document.getElementById('jsoneditor');

    var options = {
      mode: 'code',
      modes: ['code', 'form', 'text', 'tree', 'view'], // allowed modes
      onError: function (err) {
        alert(err.toString());
      },
      onModeChange: function (newMode, oldMode) {
        debugx.enabled && debugx('Mode switched from %s to %s', oldMode, newMode);
      }
    };

    var editor = new JSONEditor(container, options, null);

    var submitAction = params.submitAction || {};
    var submitOptions = submitAction.options || [];
    debugx.enabled && debugx('Submit options: %s', JSON.stringify(submitOptions));
    submitOptions.forEach(function(option) {
      var pullRight = (option.align == 'right') ? ' pull-right' : '';
      $('#submitButtons').append(substitute('<button class="btn %STYLE% %CLASS%" type="button" data-toggle="tooltip" data-container="body" title="%TITLE%" id="%ID%">%LABEL%</button>', {
        '%CLASS%': 'submitButton' + pullRight,
        '%ID%': option.value,
        '%LABEL%': option.label,
        '%TITLE%': option.description,
        '%STYLE%': option.style ? ('btn-' + option.style) : 'btn-default'
      }));
    });

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
        debugx.enabled && debugx("loadDocumentList() - error: %s", JSON.stringify(error));
      });
    };

    self.clearEditor = function() {
      editor.setText('');
    }

    self.getJsonInfo = function(id) {
      if (id == '__NULL__') return;
      if (params.infoAction && params.infoAction.path) {
        $.getJSON(substitute(params.infoAction.path, {
          "%DOCUMENT_ID%": id
        }), {}).done(function( jsonContent ) {
          jsonContent = jsonContent || {};
          var placeholder = {};
          Object.keys(jsonContent).forEach(function(field) {
            placeholder['%' + field + '%'] = jsonContent[field];
          });
          $('#messageBox').html(substitute(params.infoAction.message, placeholder));
        });
      }
    }

    self.loadJsonDocument = function(id) {
      if (id == '__NULL__') {
        self.clearEditor();
        documentId = null;
        return;
      }
      if (params.loadAction) {
        $.getJSON(substitute(params.loadAction.path, {
          "%DOCUMENT_ID%": id
        }), {}).done(function( jsonContent ) {
          documentId = id;
          editor.set(jsonContent);
        });
      }
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
      }).done(function() {
        self.getJsonInfo(id);
        self.loadJsonDocument(id);
      });
    }

    self.loadConfigList();
    self.clearEditor();

    $(document).ready(function() {
      $('[data-toggle="tooltip"]').tooltip({
        container : 'body'
      });

      $('#jsoneditorTextList').change(function() {
        var id = $(this).val();
        self.loadJsonDocument(id);
      });

      $('.loadButton').click(function() {
        var id = $('#jsoneditorTextList option:selected').val();
        self.loadJsonDocument(id);
      });

      $('.submitButton').click(function() {
        var action = $(this).attr('id');
        debugx.enabled && debugx('Submit action: %s', action);
        if (documentId && action) {
          self.saveJsonDocument(documentId, { action: action });
        }
      });
    });
  };

  function substitute(str, data) {
    return str.replace(/%[^%]+%/g, function(match) {
      return (match in data) ? data[match] : "";
    });
  }

  var debugx = function() {
    console.log.apply(console, arguments);
  }
  debugx.enabled = true;

})(this, jQuery);
