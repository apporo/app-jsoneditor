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

    resetJsonDocumentEditor = function() {
      documentId = null;
      editor.setText('');
      $('#messageBox').html('');
    }

    self.loadJsonDocumentList = function() {
      var promises = [];
      if (params.listAction && params.listAction.path) {
        var p1 = $.getJSON(params.listAction.path, {}).done(function( agents ) {
          $('#jsoneditorTextList').append('<option value="__NULL__">(choose a document)</option>');
          agents = agents || [];
          agents.forEach(function(agent) {
            agent = agent || {};
            $('#jsoneditorTextList').append('<option value="' + agent.name + '">' + agent.description + '</option>');
          });
          return self.loadJsonDocument();
        }).fail(function(error) {
          debugx.enabled && debugx("loadDocumentList() - error: %s", JSON.stringify(error));
        });
        promises.push(p1);
      }
      return $.when.apply($, promises);
    };

    self.loadJsonDocument = function(id) {
      if (id == null || id == '__NULL__') {
        resetJsonDocumentEditor();
        return $.when();
      }
      var promises = [];
      if (params.loadAction && params.loadAction.path) {
        promises.push($.getJSON(substitute(params.loadAction.path, {
          "%DOCUMENT_ID%": id
        }), {}).done(function( jsonContent ) {
          documentId = id;
          editor.set(jsonContent);
          return id;
        }));
      }
      if (params.infoAction && params.infoAction.path) {
        promises.push($.getJSON(substitute(params.infoAction.path, {
          "%DOCUMENT_ID%": id
        }), {}).done(function( jsonContent ) {
          jsonContent = jsonContent || {};
          var placeholder = {};
          Object.keys(jsonContent).forEach(function(field) {
            placeholder['%' + field + '%'] = jsonContent[field];
          });
          $('#messageBox').html(substitute(params.infoAction.message, placeholder));
        }));
      }
      return $.when.apply($, promises);
    }

    self.saveJsonDocument = function(id, options) {
      if (id == '__NULL__') return $.when();
      var myData = Object.assign({action: options.action}, editor.get());
      var p1 = $.ajax({
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
        return self.loadJsonDocument(id);
      });
      return $.when(p1);
    }

    self.loadJsonDocumentList();

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
