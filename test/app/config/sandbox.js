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
          title: 'Example Editor',
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
                value: 'discard',
                description: 'Delete the current message',
                align: 'left',
                style: 'danger'
              },
              {
                label: 'Restore1',
                value: 'restore1',
                align: 'right',
                style: 'primary'
              },
              {
                label: 'Restore2',
                value: 'restore2',
                align: 'right',
                style: 'primary'
              },
              {
                label: 'Restore3',
                value: 'restore3',
                align: 'right',
                style: 'primary'
              },
              {
                label: 'Restore4',
                value: 'restore4',
                align: 'right',
                style: 'primary'
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
