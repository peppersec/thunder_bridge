const path = require('path')
require('dotenv').config({
  path: path.join(__dirname, '..', '.env')
})
const { privateKeyToAddress } = require('../src/utils/utils')
const privateKey = require('../config/private-keys.config')

async function main() {
  const key = await privateKey.getValidatorKey()
  const address = privateKeyToAddress(key)
  console.log(address)
}
main()
