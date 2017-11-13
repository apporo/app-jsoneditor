'use strict';

jQuery(document).ready(function( $ ) {
	console.log('Im here xxxx');
  var configwebClient = null;
  configwebClient = new ConfigwebClient({});
  configwebClient.loadConfigList();
});
