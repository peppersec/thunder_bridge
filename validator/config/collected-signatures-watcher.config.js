const baseConfig = require('./base.config')

const id = `${baseConfig.id}-collected-signatures`

module.exports = {
  ...baseConfig.bridgeConfig,
  ...baseConfig.homeConfig,
  initialize: baseConfig.initialize,
  event: 'CollectedSignatures',
  queue: 'foreign',
  name: `watcher-${id}`,
  id
}
