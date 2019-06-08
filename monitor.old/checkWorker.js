const logger = require('./logger')('checkWorker')
const { decodeBridgeMode } = require('./utils/bridgeMode')
const getBalances = require('./getBalances')
const getShortEventStats = require('./getShortEventStats')
const validators = require('./validators')
const client = require('prom-client')

const { HOME_BRIDGE_ADDRESS, HOME_RPC_URL } = process.env

const homeProvider = new Web3.providers.HttpProvider(HOME_RPC_URL)
const web3Home = new Web3(homeProvider)

const HOME_ERC_TO_ERC_ABI = require('./abis/HomeBridgeErcToErc.abi')

async function checkWorker(register) {
  const homeBridge = new web3Home.eth.Contract(HOME_ERC_TO_ERC_ABI, HOME_BRIDGE_ADDRESS)
  const bridgeModeHash = await homeBridge.methods.getBridgeMode().call()
  const bridgeMode = decodeBridgeMode(bridgeModeHash)
  logger.debug('Bridge mode:', bridgeMode)
  logger.debug('calling getBalances()')
  const balances = await getBalances(bridgeMode)
  logger.debug('calling getShortEventStats()')
  const events = await getShortEventStats(bridgeMode)
  const home = Object.assign({}, balances.home, events.home)
  const foreign = Object.assign({}, balances.foreign, events.foreign)
  const status = Object.assign({}, balances, events, { home }, { foreign })
  if (!status) throw new Error('status is empty: ' + JSON.stringify(status))

  logger.debug('calling validators()')
  const vBalances = await validators(bridgeMode)
  if (!vBalances) throw new Error('vBalances is empty: ' + JSON.stringify(vBalances))

  logger.debug('Done')

  const deposits_home_dai = new client.Gauge({
    name: 'deposits',
    help: 'Amount of DAI tokens locked on home chain',
    labelNames: ['home', 'DAI'],
  });
  register.registerMetric(deposits_home_dai);
  deposits_home_dai.set(status.home.deposits);
}

module.exports = checkWorker
