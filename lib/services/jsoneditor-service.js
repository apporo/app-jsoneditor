'use strict';

var path = require('path');
var Devebot = require('devebot');
var lodash = Devebot.require('lodash');
var debugx = Devebot.require('debug')('appJsoneditor:service');

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
    modulePath: 'bootstrap/dist'
  }, {
    name: 'jquery',
    modulePath: 'jquery/dist'
  }, {
    name: 'jsoneditor',
    modulePath: 'jsoneditor/dist'
  }];
  
  self.buildJavascriptLibraries = function(clientLibs, layers) {
    clientLibs = clientLibs || [];
    layers = layers || [];
    for(var i=0; i<clientLibs.length; i++) {
      layers.push({
        name: 'app-configweb-lib-' + clientLibs[i].name,
        path: contextPath + '/editor/lib/' + clientLibs[i].name,
        middleware: express.static(path.join(__dirname, '../../node_modules/' + clientLibs[i].modulePath))
      });
    }
    return layers;
  }

  self.buildViewRouter = function(express, app) {
    app = app || new express();
    app.set('views', path.join(__dirname, '/../../views/editor'));
    app.set('view engine', 'ejs');
    app.get(['/', '/index.html'], function(req, res, next) {
      res.render('index', {
      });
    });
    return app;
  };

  self.getDynamicWebLayer = function() {
    return {
      name: 'app-configweb-editor',
      path: contextPath + '/editor',
      middleware: self.buildViewRouter(express)
    };
  }

  self.getStaticFilesLayer = function() {
    return {
      name: 'app-configweb-assets',
      path: contextPath + '/editor',
      middleware: express.static(path.join(__dirname, '../../public/editor'))
    };
  }

  if (pluginCfg.autowired !== false) {
    debugx.enabled && debugx(' - register app-jsoneditor with app-webweaver');
    var layers = self.buildJavascriptLibraries(clientLibs);
    layers.push(self.getStaticFilesLayer());
    layers.push(self.getDynamicWebLayer());
    params.webweaverService.push(layers, pluginCfg.priority);
  }

  // var router = new express();
  // router.set('views', __dirname + '/../../views');
  // router.set('view engine', 'ejs');
  // router.route('/editor').get(function(req, res, next) {
  //   res.render('editor', {});
  // });

  // self.getJsoneditorEditorLayer = function() {
  //   return {
  //     name: 'app-jsoneditor-editor',
  //     path: contextPath,
  //     middleware: router
  //   }
  // }

  // self.getJsoneditorModuleLayer = function() {
  //   return {
  //     name: 'app-jsoneditor-module',
  //     path: contextPath,
  //     middleware: express.static(path.join(__dirname, '../../node_modules/jsoneditor'))
  //   }
  // }

  // if (pluginCfg.autowired !== false) {
  //   debugx.enabled && debugx(' - register app-jsoneditor with app-webweaver');
  //   params.webweaverService.push([
  //     self.getJsoneditorEditorLayer(),
  //     self.getJsoneditorModuleLayer()
  //   ], pluginCfg.priority);
  // }

  debugx.enabled && debugx(' - constructor end!');
};

Service.argumentSchema = {
  "id": "jsoneditorService",
  "type": "object",
  "properties": {
    "webweaverService": {
      "type": "object"
    }
  }
};

module.exports = Service;
