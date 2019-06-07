const logger = require('./logger')('checkWorker3')
const stuckTransfers = require('./stuckTransfers')
const client = require('prom-client')

async function checkWorker3(register) {
  logger.debug('calling stuckTransfers()')
  const transfers = await stuckTransfers()
  // console.log(transfers)
  if (!transfers) throw new Error('transfers is empty: ' + JSON.stringify(transfers))

  logger.debug('Done')


}
module.exports = checkWorker3
