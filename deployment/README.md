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
- Note new contract addresses in console and in addresses.json file, you will
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
- `cp config.json.example config.json`
- `cp .env.example .env`
- Customize `.env` and `config.json` files as needed
- Deploy the ui backend
```
docker-compose up -d
```

## Monitoring
- ssh to a monitoting host
- git clone the repo
- cd to [frontend](./frontend) folder
- Deploy the webserver
```
docker-compose up -d
``` 
- Open [monitoring](./monitoring) folder
- Customize `.env` file as needed
- Deploy the monitoring backend
```
docker-compose up -d
```

Now you can open `MONITORING_HOSTNAME` in the browser

### Docker-machine
1. `docker-machine scp -r alertmanager <DOCKER_MACHINE_NAME>:<PATH_TO_FOLDER_ON_MACHINE>thunder_bridge/deployment/monitoring/`
2. `docker-machine scp -r grafana <DOCKER_MACHINE_NAME>:<PATH_TO_FOLDER_ON_MACHINE>thunder_bridge/deployment/monitoring/`
3. `docker-machine scp -r prometheus <DOCKER_MACHINE_NAME>:<PATH_TO_FOLDER_ON_MACHINE>thunder_bridge/deployment/monitoring/`
4. `docker-machine scp config.json <DOCKER_MACHINE_NAME>:<PATH_TO_FOLDER_ON_MACHINE>thunder_bridge/deployment/monitoring/` 