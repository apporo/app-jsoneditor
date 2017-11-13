'use strict';

jQuery(document).ready(function( $ ) {
  var configwebClient = null;
  window.addEventListener('load', function() {
    configwebClient = new ConfigwebClient({});
    configwebClient.loadConfigList();
  });
});
