'use strict';

var events = require('events');
var util = require('util');
var path = require('path');

var Devebot = require('devebot');
var lodash = Devebot.require('lodash');
var debug = Devebot.require('debug');
var debuglog = debug('jsoneditor:service');

var Service = function(params) {
  debuglog(' + constructor begin ...');

  Service.super_.apply(this);

  params = params || {};

  var self = this;

  self.getSandboxName = function() {
    return params.sandboxName;
  };

  self.logger = params.loggingFactory.getLogger();

  var cfgJsoneditor = lodash.get(params, ['sandboxConfig', 'plugins', 'appJsoneditor'], {});
  var contextPath = cfgJsoneditor.contextPath || '/jsoneditor';

  debuglog(' - attach plugin app-jsoneditor into app-webserver');

  var webserverTrigger = params.webserverTrigger;
  var express = webserverTrigger.getExpress();
  var position = webserverTrigger.getPosition();

  webserverTrigger.inject(express.static(path.join(__dirname, '../../node_modules/jsoneditor')),
      contextPath + '/module', position.inRangeOfStaticFiles(), 'jsoneditor-module');

  self.getServiceInfo = function() {
    return {};
  };

  self.getServiceHelp = function() {
    return {};
  };

  debuglog(' - constructor end!');
};

Service.argumentSchema = {
  "id": "jsoneditorService",
  "type": "object",
  "properties": {
    "sandboxName": {
      "type": "string"
    },
    "sandboxConfig": {
      "type": "object"
    },
    "profileConfig": {
      "type": "object"
    },
    "generalConfig": {
      "type": "object"
    },
    "loggingFactory": {
      "type": "object"
    },
    "webserverTrigger": {
      "type": "object"
    }
  }
};

util.inherits(Service, events.EventEmitter);

module.exports = Service;
