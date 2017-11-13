var contextPath = '/jsoneditor-bdd';

module.exports = {
  application: {
    contextPath: contextPath
  },
  plugins: {
    appJsoneditor: {
      contextPath: contextPath
    },
    appWebweaver: {
      defaultRedirectUrl: contextPath + '/index'
    }
  }
};
