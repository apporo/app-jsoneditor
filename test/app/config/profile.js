module.exports = {
  logger: {
    transports: {
      console: {
        type: 'console',
        level: 'error',
        json: false,
        timestamp: true,
        colorize: true
      }
    }
  },
  newFeatures: {
    application: {
      logoliteEnabled: true,
      sandboxConfig: true
    }
  }
};
