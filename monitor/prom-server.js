const express = require('express')
const app = express()
const client = require('prom-client')
const register = new client.Registry()
const checkWorker1 = require('./checkWorker')
const checkWorker2 = require('./checkWorker2')
const checkWorker3 = require('./checkWorker3')

setInterval(async () => {
  try {
    await Promise.all([
      checkWorker1(register),
      checkWorker2(register),
      checkWorker3(register),
    ])
  } catch (e) {
    console.error("Error collecting metrics", e);
  }
}, 60000)

app.get('/', async (req, res) => {
  res.send('Use /metrics')
})

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(register.metrics());
})

const port = process.env.PORT || 3000
app.set('port', port)
app.listen(port, () => console.log('Monitoring app listening on port 3000!'))
