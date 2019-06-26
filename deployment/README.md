# Deploying
For all Bridge parts you have to have [Docker](https://www.docker.com/) installed on the host. 

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

## User interface
- Open the [frontend](./frontend) folder
- Deploy the webserver:
```
docker-compose up -d
``` 
- Go to [ui](./ui) folder
- `cp .env.example .env`
- Customize `.env` as needed
- Copy UI config to UI source dir `cp .env ../ui` - those files need to be in sync 
- Deploy the ui backend
```
docker-compose up -d
```
Since there is config in source directory, if you change the config you will need to make sure the container is rebuilt when redeploying:

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
- Deploy the monitoring backend
```
docker-compose up -d
```

Now you can open `MONITORING_HOSTNAME` in the browser