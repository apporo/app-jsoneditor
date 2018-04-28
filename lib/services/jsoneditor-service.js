'use strict';

var path = require('path');
var Devebot = require('devebot');
var lodash = Devebot.require('lodash');
var debugx = Devebot.require('pinbug')('app-jsoneditor:service');

var Service = function(params) {
  debugx.enabled && debugx(' + constructor begin ...');

  params = params || {};

  var self = this;
  var logger = params.loggingFactory.getLogger();

  var pluginCfg = params.sandboxConfig;
  var contextPath = pluginCfg.contextPath || '/jsoneditor';
  var express = params.webweaverService.express;

  var clientLibs = [{
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
    for(var i=0; i<clientLibs.length; i++) {
      let clientDir = path.join(path.dirname(require.resolve(clientLibs[i].modulePath)),
          clientLibs[i].relativePath);
      debugx.enabled && debugx(' - client[%s] path: %s', clientLibs[i].name, clientDir);
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
    var app = new express();
    app.set('views', path.join(__dirname, '/../../views/editor'));
    app.set('view engine', 'ejs');
    app.get(['/', '/index.html'], function(req, res, next) {
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
    debugx.enabled && debugx(' - register app-jsoneditor with app-webweaver');
    var layers = self.buildJavascriptLibraries(clientLibs);
    layers.push(self.getStaticFilesLayer());
    lodash.forEach(pluginCfg.descriptors, function(descriptor) {
      layers.push(self.getDynamicWebLayer(descriptor));
    });
    params.webweaverService.push(layers, pluginCfg.priority);
  }

  debugx.enabled && debugx(' - constructor end!');
};

Service.referenceList = [ "webweaverService" ];

module.exports = Service;
