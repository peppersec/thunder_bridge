const express = require('express');
const client = require('prom-client');
const deepmerge = require('deepmerge');

const Web3 = require('web3')
const { decodeBridgeMode } = require('./utils/bridgeMode')

const {readFileSync} = require('fs');

const config = JSON.parse(readFileSync("config.json", "utf8"));

const registry = new client.Registry();


function mkDict(pairs) {
  const res = {}
  for (let i in pairs) {
    const p = pairs[i];
    res[p[0]]=p[1];
  }
  return res;
}

function mkGaugedataRow(names, labelNames) {
  return mkDict(names.map(name => [name, {name, help:name, labelNames}]))
}

const gauges = {}



const G_STATUSBRIDGES = mkGaugedataRow(["totalSupply", "deposits", "withdrawals", "requiredSignatures"], ["network", "token"]);
const G_STATUS = mkGaugedataRow(["balanceDiff", "lastChecked", "depositsDiff", "withdrawalDiff", "requiredSignaturesMatch", "validatorsMatch"], ["token"]);
const G_VALIDATORS = mkGaugedataRow(["balance", "leftTx", "gasPrice"], ["network", "token", "validator"]);


function updateRegistry(gaugeRow, name, tags, value){
  const gd = gaugeRow[name];
  const g = (name in gauges) ? gauges[name] : (function(){
    const ng = new client.Gauge(gd);
    gauges[name]=ng;
    registry.registerMetric(ng);
    return ng;
  })();

  if (typeof(value)!=="undefined")
    g.set(mkDict(gd.labelNames.map(s => [s, tags[s]])), Number(value));
}



function updateAllData(data, token) {
  for(let name in G_STATUS)
    updateRegistry(G_STATUS, name, {token}, data[name]);

  ["home", "foreign"].forEach(network => {
    for(let name in G_STATUSBRIDGES) 
      updateRegistry(G_STATUSBRIDGES, name, {network, token}, data[network][name]);
    for(let validator in data[network]["validators"])
      for(let name in G_VALIDATORS)
        updateRegistry(G_VALIDATORS, name, {network, token, validator}, data[network]["validators"][validator][name])
  });
}


async function checkWorker(token) {
  const context = config[token];
  try {
    const { HOME_BRIDGE_ADDRESS, HOME_RPC_URL }  = context;
    const homeProvider = new Web3.providers.HttpProvider(HOME_RPC_URL)
    const web3Home = new Web3(homeProvider)
    
    const HOME_ERC_TO_ERC_ABI = require('./abis/HomeBridgeErcToErc.abi')
    
    const getBalances = require('./getBalances')(context)
    const getShortEventStats = require('./getShortEventStats')(context)
    const validators = require('./validators')(context)
    // const eventsStats = require('./eventsStats')(context)
    // const getAlerts = require('./alerts')(context)


    const homeBridge = new web3Home.eth.Contract(HOME_ERC_TO_ERC_ABI, HOME_BRIDGE_ADDRESS)
    const bridgeModeHash = await homeBridge.methods.getBridgeMode().call()
    const bridgeMode = decodeBridgeMode(bridgeModeHash)
    const balances = await getBalances(bridgeMode)
    const events = await getShortEventStats(bridgeMode)
    const home = Object.assign({}, balances.home, events.home)
    const foreign = Object.assign({}, balances.foreign, events.foreign)
    const status = Object.assign({}, balances, events, { home }, { foreign })
    if (!status) throw new Error('status is empty: ' + JSON.stringify(status))
    const vBalances = await validators(bridgeMode)
    if (!vBalances) throw new Error('vBalances is empty: ' + JSON.stringify(vBalances))
    // const evStats = await eventsStats()
    // if (!evStats) throw new Error('evStats is empty: ' + JSON.stringify(evStats))
    // const alerts = await getAlerts()
    // if (!alerts) throw new Error('alerts is empty: ' + JSON.stringify(alerts))
    const res = deepmerge(status, vBalances);
    console.log(token, JSON.stringify(vBalances, null, 4));
    updateAllData(res, token)
    return {status, vBalances}
  } catch (e) {
    throw e
  }
}


// let testdata = {
//   "home": {
//       "totalSupply": "0.000009",
//       "deposits": 2,
//       "withdrawals": 2,
//       "validators": {
//           "0x553963b10b2a65d221d2648dfdfb76b2fc222bf4": {
//               "balance": "1.165825823912",
//               "leftTx": 3886086079706,
//               "gasPrice": 1
//           }
//       },
//       "requiredSignatures": 1
//   },
//   "foreign": {
//       "erc20Balance": "0.000009",
//       "deposits": 2,
//       "withdrawals": 2,
//       "validators": {
//           "0x553963b10b2a65d221d2648dfdfb76b2fc222bf4": {
//               "balance": "0.994104141",
//               "leftTx": 3012,
//               "gasPrice": 1.1
//           }
//       },
//       "requiredSignatures": 1
//   },
//   "balanceDiff": 0,
//   "lastChecked": 1559936292,
//   "depositsDiff": 0,
//   "withdrawalDiff": 0,
//   "requiredSignaturesMatch": true,
//   "validatorsMatch": true
// }

// updateAllData(testdata, "token1");

function updateTokens(){
  for(let token in config)
    checkWorker(token);
}
setInterval(updateTokens, 120000);
updateTokens()


const server = express();
console.log("Hosted at http://127.0.0.1:8080/")
server.get('/metrics', (req, res) => {
    res.set('Content-Type', registry.contentType);
    res.end(registry.metrics());
});
server.listen(8080);