'use strict';

const path = require('path');
const Devebot = require('devebot');
const chores = Devebot.require('chores');
const lodash = Devebot.require('lodash');

function JsoneditorService(params) {
  params = params || {};

  let self = this;
  let LX = params.loggingFactory.getLogger();
  let TR = params.loggingFactory.getTracer();
  let packageName = params.packageName || 'app-jsoneditor';
  let blockRef = chores.getBlockRef(__filename, packageName);

  LX.has('silly') && LX.log('silly', TR.toMessage({
    tags: [ blockRef, 'constructor-begin' ],
    text: ' + constructor start ...'
  }));

  let pluginCfg = params.sandboxConfig;
  let contextPath = pluginCfg.contextPath || '/jsoneditor';
  let webweaverService = params["app-webweaver/webweaverService"];
  let express = webweaverService.express;

  let clientLibs = [{
    name: 'bootstrap',
    modulePath: 'bootstrap',
    relativePath: '/..'
  }, {
    name: 'jquery',
    modulePath: 'jquery',
    relativePath: '/.'
  }, {
    name: 'jsoneditor',
    modulePath: 'jsoneditor',
    relativePath: '/dist'
  }];
  
  self.buildJavascriptLibraries = function(clientLibs, layers) {
    clientLibs = clientLibs || [];
    layers = layers || [];
    for(let i=0; i<clientLibs.length; i++) {
      let clientDir = path.join(path.dirname(require.resolve(clientLibs[i].modulePath)),
          clientLibs[i].relativePath);
      LX.has('debug') && LX.log('debug', TR.add({
        clientName: clientLibs[i].name,
        clientPath: clientDir
      }).toMessage({
        text: ' - client[${clientName}] path: ${clientPath}'
      }));
      layers.push({
        name: 'app-jsoneditor-lib-' + clientLibs[i].name,
        path: contextPath + '/editor/lib/' + clientLibs[i].name,
        middleware: express.static(clientDir)
      });
    }
    return layers;
  }

  self.buildViewRouter = function(express, descriptor) {
    descriptor = descriptor || {};
    let app = new express();
    app.set('views', path.join(__dirname, '/../../views/editor'));
    app.set('view engine', 'ejs');
    app.get(['/index', '/index.html'], function(req, res, next) {
      res.render('index', {
        descriptor: descriptor
      });
    });
    app.get(['/js/jsoneditor-loader.js'], function(req, res, next) {
      res.render('loader-js', {
        descriptor: descriptor
      });
    });
    return app;
  };

  self.getDynamicWebLayer = function(descriptor) {
    descriptor = descriptor || {};
    return {
      name: 'app-jsoneditor-editor',
      path: contextPath + '/editor/' + descriptor.name,
      middleware: self.buildViewRouter(express, descriptor)
    };
  }

  self.getStaticFilesLayer = function() {
    return {
      name: 'app-jsoneditor-assets',
      path: contextPath + '/editor',
      middleware: express.static(path.join(__dirname, '../../public/editor'))
    };
  }

  if (pluginCfg.autowired !== false) {
    LX.has('debug') && LX.log('debug', TR.toMessage({
      tags: [ blockRef, 'register-webweaver' ],
      text: ' - register app-jsoneditor with app-webweaver'
    }));
    let layers = self.buildJavascriptLibraries(clientLibs);
    layers.push(self.getStaticFilesLayer());
    lodash.forEach(pluginCfg.descriptors, function(descriptor) {
      layers.push(self.getDynamicWebLayer(descriptor));
    });
    webweaverService.push(layers, pluginCfg.priority);
  }

  LX.has('silly') && LX.log('silly', TR.toMessage({
    tags: [ blockRef, 'constructor-end' ],
    text: ' - constructor end!'
  }));
};

JsoneditorService.referenceList = [ "app-webweaver/webweaverService" ];

module.exports = JsoneditorService;
