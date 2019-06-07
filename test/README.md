
To test validator and contract you can use following steps:

`cd ../deployment/validator`
`make sure you have filled TESTING section in .env`
`docker-compose run bridge sendForeign` to send bridgable token from Foreign to Home
`docker-compose run bridge sendHome` to send bridgable token from Home to Foreign