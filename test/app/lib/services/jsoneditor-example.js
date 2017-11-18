'use strict';

var path = require('path');
var Devebot = require('devebot');
var Promise = Devebot.require('bluebird');
var lodash = Devebot.require('lodash');
var debugx = Devebot.require('debug')('appJsoneditor:example');

var Service = function(params) {
  debugx.enabled && debugx(' + constructor begin ...');

  params = params || {};
  var self = this;

  var logger = params.loggingFactory.getLogger();
  var contextPath = params.sandboxConfig.contextPath || '/jsoneditor';
  var express = params.webweaverService.express;

  var dataStore = {
    example_1: {
      description: 'Example 1',
      data: {
        field1: 'Value 1.1',
        field2: 'Value 1.2'
      }
    },
    example_2: {
      description: 'Example 2',
      data: {
        field1: 'Value 2.1',
        field2: 'Value 2.2'
      }
    }
  }

  var router = express.Router();

  router.route('/').get(function(req, res, next) {
    debugx.enabled && debugx(' - GET [%s]', req.url);
    var refs = [];
    lodash.forEach(dataStore, function(value, key) {
      refs.push(lodash.assign(lodash.pick(value, ['description']), { name: key }));
    })
    res.json(refs);
  });

  router.route('/:configName').get(function(req, res, next) {
    debugx.enabled && debugx(' - GET [%s]', req.url);
    res.json(dataStore[req.params.configName].data);
  });

  router.route('/:configName').put(function(req, res, next) {
    if (!lodash.isObject(req.body)) {
      res.status(404).json({
        status: 404,
        message: 'Invalid config data'
      });
    }
    dataStore[req.params.configName].data = req.body;
    res.json({ message: 'Successful' });
  });

  self.getDynamicWebLayer = function() {
    return {
      name: 'app-jsoneditor-example',
      path: contextPath + '/rest',
      middleware: router
    };
  }

  self.getStaticFilesLayer = function() {
    return {
      name: 'app-jsoneditor-example-assets',
      path: contextPath + '/assets',
      middleware: express.static(path.join(__dirname, '../../public/assets'))
    };
  }

  params.webweaverService.push([
    self.getStaticFilesLayer(),
    params.webweaverService.getJsonBodyParserLayer(),
    self.getDynamicWebLayer()
  ]);

  debugx.enabled && debugx(' - constructor end!');
};

Service.argumentSchema = {
  "id": "jsoneditorExample",
  "type": "object",
  "properties": {
    "webweaverService": {
      "type": "object"
    }
  }
};

module.exports = Service;
