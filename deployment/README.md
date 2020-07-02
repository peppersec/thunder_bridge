# Deploying
For all Bridge parts you have to have [Docker](https://www.docker.com/) and [Node.js](https://nodejs.org/) installed on the host. You can use docker with remote access for convenience.

## Contracts

- Open the [contracts](./contracts) folder
- `cp .env.example .env`
- Customize `.env` file as needed (you can see detailed description in [contracts/README.md](contracts/README.md))
- To deploy contracts run
```
docker-compose run contracts deploy
```
- Note new contract addresses in console and in `deployment/contracts/data/addresses.json` file, you will
  need to put deployed addresses into your `.env` files in other modules

## Validator
- Open the [validator](./validator) folder
- Customize `.env` file as needed
- Launch the Bridge
```
docker-compose -p TOKEN_NAME up -d
```
If you want to deploy multiple validators to the same machine (for example for testing), 
you need to  use `-p TOKEN_NAME_VALIDATOR_INDEX` or something similar - it has to be unique for 
each deployment on the same machine.

### Storing validator private keys 

Validator private keys need to be stored as objects on AWS S3 and encrypted by AWS KMS 
master key. You need to make sure that validators don't have access to each others 
private keys. Ideally, each validator needs to have own IAM user, KMS master key, and 
be able to read only own encrypted private key from S3.

## User interface
- Open the [frontend](./frontend) folder
- Deploy the webserver:
```
docker-compose up -d
``` 
- Go to [ui](./ui) folder
- Customize `.env` as needed
- Copy UI config to UI source dir `cp .env ../../ui/` - those files need to be in sync 
- Deploy the ui backend
```
docker-compose up -d
```
Since there is a config in source directory, if you change the config after deployment,
you will need to make sure the container is rebuilt when redeploying/updating:
```
docker-compose up -d --rebuild --force-recreate
```

## Monitoring
- cd to [frontend](./frontend) folder
- Deploy the webserver
```
docker-compose up -d
``` 
- Go to [monitoring source](../monitor)
- `cp config.json.example config.json`
- Customize `config.json` as needed
- Open [monitoring](./monitoring) folder
- Customize `.env` file as needed
- To receive notifications you need to enter your credentials 
to `config/alertmanager/config.yml`
- Deploy the monitoring backend
```
docker-compose up -d
```

Now you can open `MONITORING_HOSTNAME` in the browser
