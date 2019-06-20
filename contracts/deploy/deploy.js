const fs = require('fs')
const path = require('path')
const env = require('./src/loadEnv')

const { BRIDGE_MODE, ERC20_TOKEN_ADDRESS } = env

async function deployErcToErc() {
  const deployHome = require('./src/erc_to_erc/home')
  const deployForeign = require('./src/erc_to_erc/foreign')

  const { homeBridge, erc677 } = await deployHome()
  const { foreignBridge } = await deployForeign()
  console.log('\nDeployment has been completed.\n\n')
  console.log(
    `[   Home  ] HomeBridge: ${homeBridge.address} at block ${homeBridge.deployedBlockNumber}`
  )
  console.log(`[   Home  ] ERC677 Bridgeable Token: ${erc677.address}`)
  console.log(
    `[ Foreign ] ForeignBridge: ${foreignBridge.address} at block ${
      foreignBridge.deployedBlockNumber
    }`
  )
  console.log(`[ Foreign ] ERC20 Token: ${ERC20_TOKEN_ADDRESS}`)
  if (!fs.existsSync('data'))
    fs.mkdirSync('data', {recursive: true})
  fs.writeFileSync(
    'data/deployed.json',
    JSON.stringify(
      {
        homeBridge: {
          ...homeBridge,
          erc677
        },
        foreignBridge: {
          ...foreignBridge
        }
      },
      null,
      4
    )
  )
  console.log('Contracts Deployment have been saved to `data/deployed.json`')
}

async function main() {
  console.log(`Bridge mode: ${BRIDGE_MODE}`)
  switch (BRIDGE_MODE) {
    case 'ERC_TO_ERC':
      await deployErcToErc()
      break
    default:
      console.log(BRIDGE_MODE)
      throw new Error('Please specify BRIDGE_MODE: ERC_TO_ERC')
  }
}

main().catch(e => console.log('Error:', e))
