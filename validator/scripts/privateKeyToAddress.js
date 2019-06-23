const path = require('path')
require('dotenv').config({
  path: path.join(__dirname, '..', '.env')
})
const { privateKeyToAddress } = require('../src/utils/utils')
const privateKey = require('../config/private-keys.config')

const address = privateKeyToAddress(privateKey.getValidatorKey())

console.log(address)
