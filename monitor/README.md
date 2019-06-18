
# TokenBridge monitor software

# How to Use

## Installation and Deployment

```bash
npm i
```

### Run Validator software 

```bash
npm run start
```

Visit http://localhost:3000/metrics

## Configuration parameters

| Variable | Description | Values |
|-------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|
| `TOKEN_LABELS` | Names of tokens separated by spaces. Minimum length of label is 2 symbols.| `DAI:USDT` |
| `HOME_RPC_URL` | The HTTPS URL used to communicate to the RPC nodes in the Home network.  | URL |
| `FOREIGN_RPC_URL` | The HTTPS URL used to communicate to the RPC nodes in the Foreign network. | URL |
| `GAS_PRICE_SPEED_TYPE` | Assuming the gas price oracle responds with the following JSON structure: `{"fast": 20.0, "block_time": 12.834, "health": true, "standard": 6.0, "block_number": 6470469, "instant": 71.0, "slow": 1.889}`, this parameter specifies the desirable transaction speed. | `instant` / `fast` / `standard` / `slow` |
| `GAS_PRICE_FALLBACK` | The gas price (in Wei) that is used if both the oracle and the fall back gas price specified in the Foreign Bridge contract are not available. | integer |
| `GAS_LIMIT` | The gas limit, using to estimate cost of transactions. | integer |
| `UPDATE_PERIOD` | The time to update the scan, milliseconds. | integer |
| `${LABEL}_HOME_BRIDGE_ADDRESS` | The address of the bridge contract address in the Home network. It is used to listen to events from and send validators' transactions to the Home network. | hexidecimal beginning with "0x" |
| `${LABEL}_FOREIGN_BRIDGE_ADDRESS` | The  address of the bridge contract address in the Foreign network. It is used to listen to events from and send validators' transactions to the Foreign network. | hexidecimal beginning with "0x" |
| `${LABEL}_HOME_DEPLOYMENT_BLOCK` | The block number in the Home network used to start watching for events when the bridge instance is run for the first time. Usually this is the same block where the Home Bridge contract is deployed. | integer |
| `${LABEL}_FOREIGN_DEPLOYMENT_BLOCK` | The block number in the Foreign network used to start watching for events when the bridge instance runs for the first time. Usually this is the same block where the Foreign Bridge contract was deployed to. | integer |



## License

[![License: GPL v3.0](https://img.shields.io/badge/License-GPL%20v3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

This project is licensed under the GNU Lesser General Public License v3.0. See the [LICENSE](LICENSE) file for details.
