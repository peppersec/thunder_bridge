FROM prom/alertmanager
COPY config.yml /etc/alertmanager/
CMD ["--config.file=/etc/alertmanager/config.yml", "--storage.path=/alertmanager"]