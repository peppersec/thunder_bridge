const config = (process.argv.length>=3) ? {path: process.argv[process.argv.length-2]} : undefined;
const prefix = (process.argv.length>1) ? process.argv[process.argv.length-1] : "";

const fs = require('fs')
const path = require('path')
const logger = require('./logger')('checkWorker2')
const eventsStats = require('./eventsStats')
const alerts = require('./alerts')

const linearize = require('./linearize.js')
const separator = "_";

async function checkWorker2() {
  try {
    logger.debug('calling eventsStats()')
    const evStats = await eventsStats()
    if (!evStats) throw new Error('evStats is empty: ' + JSON.stringify(evStats))
    fs.appendFileSync(
      path.join(__dirname, '/responses/eventsStats.dat'),
      linearize(evStats, prefix, separator)
      //JSON.stringify(evStats, null, 4)
    )
    logger.debug('calling alerts()')
    const _alerts = await alerts()
    if (!_alerts) throw new Error('alerts is empty: ' + JSON.stringify(_alerts))
    fs.appendFileSync(
      path.join(__dirname, '/responses/alerts.dat'),
      linearize(_alerts, prefix, separator)
      //JSON.stringify(_alerts, null, 4)
    )
    logger.debug('Done x2')
    return evStats
  } catch (e) {
    logger.error('checkWorker2.js', e)
    throw e
  }
}
checkWorker2()
