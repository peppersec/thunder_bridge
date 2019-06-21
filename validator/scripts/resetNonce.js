const Redis = require('ioredis')
const path = require('path')
require('dotenv').config({
  path: path.join(__dirname, '../.env')
})
const { EXIT_CODES } = require('../src/utils/constants')

const redis = new Redis(process.env.REDIS_URL)

redis.on('error', () => {
  logError('Error: Cannot connect to redis')
})

if (process.argv.length < 4) {
  logError('Please provide process key and new nonce value. Example:\n  foreign 13\n  home 14')
}

function logError(message) {
  console.log(message)
  process.exit(EXIT_CODES.GENERAL_ERROR)
}

function getRedisKey(name) {
  return `${name}:nonce`
}

async function main() {
  try {
    const processName = process.argv[2]
    const rawNonceValue = process.argv[3]

    const newNonceValue = Number(rawNonceValue)
    if (!Number.isInteger(newNonceValue)) {
      logError('Expecting new nonce value to be an integer!')
    }

    const nonceRedisKey = getRedisKey(processName)

    const value = await redis.get(nonceRedisKey)

    if (!value) {
      logError('Please provide process key and new nonce value. Example:\n  foreign 13\n  home 14')
    }

    await redis.set(nonceRedisKey, newNonceValue)

    console.log(`${processName} last block updated to ${newNonceValue}`)

    redis.disconnect()
  } catch (e) {
    console.log(e)
  }
}

main()
