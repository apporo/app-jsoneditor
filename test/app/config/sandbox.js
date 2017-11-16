var contextPath = '/jsoneditor';

module.exports = {
  application: {
    contextPath: contextPath
  },
  plugins: {
    appJsoneditor: {
      contextPath: contextPath,
      descriptors: [
        {
          name: 'example',
          listAction: {
            path: '/jsoneditor/rest',
            method: 'GET'
          },
          loadAction: {
            path: '/jsoneditor/rest/%DOCUMENT_ID%',
            method: 'GET'
          },
          submitAction: {
            path: '/jsoneditor/rest/%DOCUMENT_ID%',
            method: 'PUT',
            options: [
              {
                label: 'Discard',
                value: 'discard'
              },
              {
                label: 'Restore',
                value: 'restore'
              }
            ]
          }
        }
      ]
    },
    appWebweaver: {
      defaultRedirectUrl: contextPath + '/index'
    }
  }
};
