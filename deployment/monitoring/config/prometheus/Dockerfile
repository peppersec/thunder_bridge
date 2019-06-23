FROM prom/prometheus:v2.1.0
COPY prometheus.yml /etc/prometheus/
COPY alert.rules /etc/prometheus/
CMD ["--config.file=/etc/prometheus/prometheus.yml", "--storage.tsdb.path=/prometheus", "--web.console.libraries=/usr/share/prometheus/console_libraries", "--web.console.templates=/usr/share/prometheus/consoles"]