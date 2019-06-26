# Monitoring configuration

Monitoring consists of 4 parts:

- `Monitor` that gathers data from blockchain
- `Prometheus` that scrapes and stores this data
- `Alertmanager` that sends alert notifications
- `Grafana` that displays dashboard with graphs

Grafana is the only externally available instance. It has anonymous readonly access
and you can log in as admin to customize dashboard or graph custom metrics