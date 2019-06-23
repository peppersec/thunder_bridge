FROM grafana/grafana
USER 104
ENV GF_INSTALL_PLUGINS=camptocamp-prometheus-alertmanager-datasource
ENV GF_USERS_ALLOW_SIGN_UP=false
ENV GF_AUTH_ANONYMOUS_ENABLED=true
COPY . /etc/grafana/provisioning/
COPY dashboards/dashboard.json /usr/share/grafana/public/dashboards/home.json
