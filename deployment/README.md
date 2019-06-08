# Deploying

## Contracts
This needs to be done only once

- Open `contracts` dir
- Customize `.env` file as needed
- To deploy contracts run
```
cp .env.example .env
vi .env
docker-compose run contracts deploy
```
- Note new contract addresses in console and in addresses.json file, you will
  need to put deployed addresses into your `.env` files in other modules

## Validator
- Open `bridge` dir
- Customize `.env` file as needed
- Launch the bridge
```
cd bridge
cp .env.example .env
vi .env
docker-compose up -d
```

## User interface
- Open `frontend` dir
- Deploy the webserver
```
cd frontend
docker-compose up -d
``` 
- Go to `ui` dir
- Customize `.env` file as needed
- Deploy the ui backend
```
cd ui
cp .env.example .env
vi .env
docker-compose up -d
```

## Monitoring
- Open `frontend` dir
- Deploy the webserver
```
cd frontend
docker-compose up -d
``` 
- Open `monitoring` dir
- Customize `.env` file as needed
- Deploy the monitoring backend
```
cd monitoring
cp .env.example .env
vi .env
docker-compose up -d
```
