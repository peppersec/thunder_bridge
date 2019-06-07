
# TokenBridge

The TokenBridge is deployed on specified validator nodes (only nodes whose private keys correspond to addresses specified in the smart contracts) in the network. It connects to two chains via a Remote Procedure Call (RPC) and is responsible for:
- listening to events related to bridge contracts
- sending transactions to authorize asset transfers

## General Bridge Overview

The Bridge allows users to transfer assets between two chains in the Ethereum ecosystem. This is a customized version of [POA network Bridge](https://github.com/poanetwork/tokenbridge).

**Bridge Elements**
1. The TokenBridge contained in this repository.
2. [Solidity smart contracts](./contracts). Used to manage bridge validators, collect signatures, and confirm asset relay and disposal.
3. [Bridge UI Application](./ui). A DApp interface to transfer tokens and coins between chains.
4. [Bridge Monitor](./monitor). A tool for checking balances and unprocessed events in bridged networks.
5. [Bridge Deployment](./deployment). Manages configuration instructions for deployment.

## Network Definitions

 Bridging occurs between two networks.

 * **Home** - is a network with fast and inexpensive operations. All bridge operations to collect validator confirmations are performed on this side of the bridge.

* **Foreign** can be any chain; generally it refers to the Ethereum mainnet. 

## Operational Modes

The TokenBridge provides next operational mode:

- [x] `ERC20-to-ERC20` ERC20-compatible tokens on the Foreign network are locked and minted as ERC20-compatible tokens (ERC677 tokens) on the Home network. When transferred from Home to Foreign, they are burnt on the Home side and unlocked in the Foreign network. This can be considered a form of atomic swap when a user swaps the token "X" in network "A" to the token "Y" in network "B".

## Architecture

### ERC20-to-ERC20

![ERC-to-ERC](./validator/docs/ERC-to-ERC.png)

### Watcher
A watcher listens for a certain event and creates proper jobs in the queue. These jobs contain the transaction data (without the nonce) and the transaction hash for the related event. The watcher runs on a given frequency, keeping track of the last processed block.

If the watcher observes that the transaction data cannot be prepared, which generally means that the corresponding method of the bridge contract cannot be invoked, it inspects the contract state to identify the potential reason for failure and records this in the logs. 

There are three Watchers:
- **Signature Request Watcher**: Listens to `UserRequestForSignature` events on the Home network.
- **Collected Signatures Watcher**: Listens to `CollectedSignatures` events on the Home network.
- **Affirmation Request Watcher**: Listens to `Transfer` events raised by the token contract.

### Sender
A sender subscribes to the queue and keeps track of the nonce. It takes jobs from the queue, extracts transaction data, adds the proper nonce, and sends it to the network.

There are two Senders:
- **Home Sender**: Sends a transaction to the `Home` network.
- **Foreign Sender**: Sends a transaction to the `Foreign` network.

### RabbitMQ

[RabbitMQ](https://www.rabbitmq.com/) is used to transmit jobs from watchers to senders.

### Redis DB

Redis is used to store the number of blocks that were already inspected by watchers, and the Nonce (Number of Operation) which was used previously by the sender to send a transaction.

# How to Use

## Installation and Deployment

#### Deploy the Bridge Contracts

Go to [contracts](./deployment/contracts) folder and follow instructions.

### Run Validator software 

Go to [contracts](./deployment/validator) folder and follow instructions.

### Run Bridge UI

Go to [ui](./deployment/ui) folder and follow instructions.

## Configuration parameters

| Variable | Description | Values |
|-------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------|
| `BRIDGE_MODE` | The bridge mode. The bridge starts listening to a different set of events based on this parameter. | `ERC_TO_ERC` |
| `HOME_RPC_URL` | The HTTPS URL(s) used to communicate to the RPC nodes in the Home network. Several URLs can be specified, delimited by spaces. If the connection to one of these nodes is lost the next URL is used for connection. | URL(s) |
| `HOME_BRIDGE_ADDRESS` | The address of the bridge contract address in the Home network. It is used to listen to events from and send validators' transactions to the Home network. | hexidecimal beginning with "0x" |
| `HOME_POLLING_INTERVAL` | The interval in milliseconds used to request the RPC node in the Home network for new blocks. The interval should match the average production time for a new block. | integer |
| `FOREIGN_RPC_URL` | The HTTPS URL(s) used to communicate to the RPC nodes in the Foreign network. Several URLs can be specified, delimited by spaces. If the connection to one of these nodes is lost the next URL is used for connection. | URL(s) |
| `FOREIGN_BRIDGE_ADDRESS` | The  address of the bridge contract address in the Foreign network. It is used to listen to events from and send validators' transactions to the Foreign network. | hexidecimal beginning with "0x" |
| `ERC20_TOKEN_ADDRESS` | Used with the `ERC_TO_ERC` bridge mode, this parameter specifies the ERC20-compatible token contract address. The token contract address is used to identify transactions that transfer tokens to the Foreign Bridge account address. Omit this parameter with other bridge modes. | hexidecimal beginning with "0x" |
| `FOREIGN_POLLING_INTERVAL` | The interval in milliseconds used to request the RPC node in the Foreign network for new blocks. The interval should match the average production time for a new block. | integer |
| `HOME_GAS_PRICE_ORACLE_URL` | The URL used to get a JSON response from the gas price prediction oracle for the Home network. The gas price provided by the oracle is used to send the validator's transactions to the RPC node. Since it is assumed that the Home network has a predefined gas price (e.g. the gas price in the Core of POA.Network is `1 GWei`), the gas price oracle parameter can be omitted for such networks. | URL |
| `HOME_GAS_PRICE_SPEED_TYPE` | Assuming the gas price oracle responds with the following JSON structure: `{"fast": 20.0, "block_time": 12.834, "health": true, "standard": 6.0, "block_number": 6470469, "instant": 71.0, "slow": 1.889}`, this parameter specifies the desirable transaction speed. The speed type can be omitted when `HOME_GAS_PRICE_ORACLE_URL` is not used. | `instant` / `fast` / `standard` / `slow` |
| `HOME_GAS_PRICE_FALLBACK` | The gas price (in Wei) that is used if both the oracle and the fall back gas price specified in the Home Bridge contract are not available. | integer |
| `HOME_GAS_PRICE_UPDATE_INTERVAL` | An interval in milliseconds used to get the updated gas price value either from the oracle or from the Home Bridge contract. | integer |
| `FOREIGN_GAS_PRICE_ORACLE_URL` | The URL used to get a JSON response from the gas price prediction oracle for the Foreign network. The provided gas price is used to send the validator's transactions to the RPC node. If the Foreign network is Ethereum Foundation mainnet, the oracle URL can be: https://gasprice.poa.network. Otherwise this parameter can be omitted. | URL |
| `FOREIGN_GAS_PRICE_SPEED_TYPE` | Assuming the gas price oracle responds with the following JSON structure: `{"fast": 20.0, "block_time": 12.834, "health": true, "standard": 6.0, "block_number": 6470469, "instant": 71.0, "slow": 1.889}`, this parameter specifies the desirable transaction speed. The speed type can be omitted when `FOREIGN_GAS_PRICE_ORACLE_URL`is not used. | `instant` / `fast` / `standard` / `slow` |
| `FOREIGN_GAS_PRICE_FALLBACK` | The gas price (in Wei) used if both the oracle and fall back gas price specified in the Foreign Bridge contract are not available. | integer |
| `FOREIGN_GAS_PRICE_UPDATE_INTERVAL` | The interval in milliseconds used to get the updated gas price value either from the oracle or from the Foreign Bridge contract. | integer |
| `VALIDATOR_ADDRESS_PRIVATE_KEY` | The private key of the bridge validator used to sign confirmations before sending transactions to the bridge contracts. The validator account is calculated automatically from the private key. Every bridge instance (set of watchers and senders) must have its own unique private key. The specified private key is used to sign transactions on both sides of the bridge. | hexidecimal without "0x" |
| `HOME_START_BLOCK` | The block number in the Home network used to start watching for events when the bridge instance is run for the first time. Usually this is the same block where the Home Bridge contract is deployed. If a new validator instance is being deployed for an existing set of validators, the block number could be the latest block in the chain. | integer |
| `FOREIGN_START_BLOCK` | The block number in the Foreign network used to start watching for events when the bridge instance runs for the first time. Usually this is the same block where the Foreign Bridge contract was deployed to. If a new validator instance is being deployed for an existing set of validators, the block number could be the latest block in the chain. | integer |
| `QUEUE_URL` | RabbitMQ URL used by watchers and senders to communicate to the message queue. Typically set to: `amqp://127.0.0.1`. | local URL |
| `REDIS_URL` | Redis DB URL used by watchers and senders to communicate to the database. Typically set to: `redis://127.0.0.1:6379`. | local URL |
| `REDIS_LOCK_TTL` | Threshold in milliseconds for locking a resource in the Redis DB. Until the threshold is exceeded, the resource is unlocked. Usually it is `1000`. | integer |
| `ALLOW_HTTP` | **Only use in test environments - must be omitted in production environments.**. If this parameter is specified and set to `yes`, RPC URLs can be specified in form of HTTP links. A warning that the connection is insecure will be written to the logs. | `yes` / `no` |
| `LOG_LEVEL` | Set the level of details in the logs. | `trace` / `debug` / `info` / `warn` / `error` / `fatal` |
| `MAX_PROCESSING_TIME` | The workers processes will be killed if this amount of time (in milliseconds) is ellapsed before they finish processing. It is recommended to set this value to 4 times the value of the longest polling time (set with the `HOME_POLLING_INTERVAL` and `FOREIGN_POLLING_INTERVAL` variables). To disable this, set the time to 0. | integer |

## License

[![License: LGPL v3.0](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)

This project is licensed under the GNU Lesser General Public License v3.0. See the [LICENSE](LICENSE) file for details.