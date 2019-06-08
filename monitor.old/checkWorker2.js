const logger = require('./logger')('checkWorker2')
const eventsStats = require('./eventsStats')
const alerts = require('./alerts')
const client = require('prom-client')

async function checkWorker2(register) {
  logger.debug('calling eventsStats()')
  const evStats = await eventsStats()
  if (!evStats) throw new Error('evStats is empty: ' + JSON.stringify(evStats))

  logger.debug('calling alerts()')
  const _alerts = await alerts()
  if (!_alerts) throw new Error('alerts is empty: ' + JSON.stringify(_alerts))

  logger.debug('Done x2')


}
module.exports = checkWorker2
