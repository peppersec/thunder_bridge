require('dotenv').config()
const baseConfig = require('./base.config')
const erc20Abi = require('../abis/ERC20.abi')

const id = `${baseConfig.id}-affirmation-request`

module.exports = {
  ...baseConfig.bridgeConfig,
  ...baseConfig.foreignConfig,
  initialize: baseConfig.initialize,
  event: 'Transfer',
  eventContractAddress: process.env.ERC20_TOKEN_ADDRESS,
  eventAbi: erc20Abi,
  eventFilter: { to: process.env.FOREIGN_BRIDGE_ADDRESS },
  queue: 'home',
  name: `watcher-${id}`,
  id
}
