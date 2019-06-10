const express = require('express');
const client = require('prom-client');
const deepmerge = require('deepmerge');

const Web3 = require('web3')
const { decodeBridgeMode } = require('./utils/bridgeMode')

const { readFileSync } = require('fs');

const config = JSON.parse(readFileSync("config.json", "utf8"));

const registry = new client.Registry();


function mkDict(pairs) {
  const res = {}
  for (let i in pairs) {
    const p = pairs[i];
    res[p[0]] = p[1];
  }
  return res;
}

function hasDeepKeys(obj, keys) {
  let cur = obj;
  for (let i in keys) {
    if ((typeof (cur) !== "object") || !(keys[i] in cur)) return false;
    cur = cur[keys[i]];
  }
  return true;
}

function mkGaugedataRow(names, labelNames) {
  return mkDict(names.map(name => [name, { name: "bridge_" + name, help: name, labelNames }]))
}

const gauges = {}



const G_STATUSBRIDGES = mkGaugedataRow(["totalSupply", "deposits", "withdrawals", "requiredSignatures"], ["network", "token"]);
const G_STATUS = mkGaugedataRow(["balanceDiff", "lastChecked", "requiredSignaturesMatch", "validatorsMatch"], ["token"]);
const G_VALIDATORS = mkGaugedataRow(["balance", "leftTx", "gasPrice"], ["network", "token", "validator"]);


function updateRegistry(gaugeRow, name, tags, value, date) {
  const gd = gaugeRow[name];
  const g = (name in gauges) ? gauges[name] : (function () {
    const ng = new client.Gauge(gd);
    gauges[name] = ng;
    registry.registerMetric(ng);
    return ng;
  })();

  if (typeof (value) !== "undefined")
    g.set(mkDict(gd.labelNames.map(s => [s, tags[s]])), Number(value), date);
}



function updateAllData(data, token) {
  // calculating date once so that all metrics in this iteration have the exact same timestamp
  const date = new Date();

  for (let name in G_STATUS)
    if (name in data)
      updateRegistry(G_STATUS, name, { token }, data[name], date);

  ["home", "foreign"].forEach(network => {
    for (let name in G_STATUSBRIDGES)
      if (hasDeepKeys(data, [network, name]))
        updateRegistry(G_STATUSBRIDGES, name, { network, token }, data[network][name], date);

    for (let validator in data[network]["validators"])
      for (let name in G_VALIDATORS)
        if (hasDeepKeys(data, [network, "validators", validator, name]))
          updateRegistry(G_VALIDATORS, name, { network, token, validator }, data[network]["validators"][validator][name], date)
  });
}


async function checkStatus(token) {
  const context = config[token];
  try {
    const { HOME_BRIDGE_ADDRESS, HOME_RPC_URL } = context;
    const homeProvider = new Web3.providers.HttpProvider(HOME_RPC_URL)
    const web3Home = new Web3(homeProvider)
    const HOME_ERC_TO_ERC_ABI = require('./abis/HomeBridgeErcToErc.abi')
    const getBalances = require('./getBalances')(context)
    const getShortEventStats = require('./getShortEventStats')(context)
    const homeBridge = new web3Home.eth.Contract(HOME_ERC_TO_ERC_ABI, HOME_BRIDGE_ADDRESS)
    const bridgeModeHash = await homeBridge.methods.getBridgeMode().call()
    const bridgeMode = decodeBridgeMode(bridgeModeHash)
    const balances = await getBalances(bridgeMode)
    const events = await getShortEventStats(bridgeMode)
    const home = Object.assign({}, balances.home, events.home)
    const foreign = Object.assign({}, balances.foreign, events.foreign)
    const status = Object.assign({}, balances, events, { home }, { foreign })
    if (!status) throw new Error('status is empty: ' + JSON.stringify(status))
    updateAllData(status, token)
    return status
  } catch (e) {
    throw e
  }
}


async function checkVBalances(token) {
  const context = config[token];
  try {
    const { HOME_BRIDGE_ADDRESS, HOME_RPC_URL } = context;
    const homeProvider = new Web3.providers.HttpProvider(HOME_RPC_URL)
    const web3Home = new Web3(homeProvider)
    const HOME_ERC_TO_ERC_ABI = require('./abis/HomeBridgeErcToErc.abi')
    const validators = require('./validators')(context)
    const homeBridge = new web3Home.eth.Contract(HOME_ERC_TO_ERC_ABI, HOME_BRIDGE_ADDRESS)
    const bridgeModeHash = await homeBridge.methods.getBridgeMode().call()
    const bridgeMode = decodeBridgeMode(bridgeModeHash)
    const vBalances = await validators(bridgeMode)
    if (!vBalances) throw new Error('vBalances is empty: ' + JSON.stringify(vBalances))
    updateAllData(vBalances, token)
    return vBalances
  } catch (e) {
    throw e
  }
}




function updateTokens() {
  for (let token in config) {
    checkStatus(token);
    checkVBalances(token);
  }
}
setInterval(updateTokens, 120000);
updateTokens();


const server = express();
server.get('/metrics', (req, res) => {
  res.set('Content-Type', registry.contentType);
  res.end(registry.metrics());
});
server.listen(3000);
