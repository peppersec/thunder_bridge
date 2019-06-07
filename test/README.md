
To test validator and contract you can use following steps:

1. `cd ../deployment/validator`
2. Make sure you have filled TESTING section in `.env`
3. `docker-compose run bridge sendForeign` to send bridgable token from Foreign to Home
4. `docker-compose run bridge sendHome` to send bridgable token from Home to Foreign