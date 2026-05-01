# syntax=docker/dockerfile:1
FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive \
    NODE_ENV=production

# Test-only default; override at build: --build-arg WEBUSER_PASSWORD=...
ARG WEBUSER_PASSWORD=changeme

RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates \
    curl \
    gnupg \
    nginx \
    openssh-server \
    php8.2-fpm \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash webuser \
    && mkdir -p /var/www/html \
    && chown -R webuser:webuser /var/www/html \
    && chmod 2750 /var/www/html \
    && usermod -aG webuser www-data \
    && echo "webuser:${WEBUSER_PASSWORD}" | chpasswd

RUN rm -f /etc/php/8.2/fpm/pool.d/www.conf \
    && printf '%s\n' \
    '[openspace]' \
    'user = webuser' \
    'group = webuser' \
    'listen = /run/php/php8.2-fpm-openspace.sock' \
    'listen.owner = www-data' \
    'listen.group = www-data' \
    'listen.mode = 0660' \
    'pm = ondemand' \
    'pm.max_children = 10' \
    'pm.max_requests = 200' \
    > /etc/php/8.2/fpm/pool.d/openspace.conf

RUN printf '%s\n' \
    'PasswordAuthentication yes' \
    'PermitRootLogin no' \
    'Subsystem sftp /usr/lib/openssh/sftp-server' \
    > /etc/ssh/sshd_config.d/99-openspace.conf \
    && ssh-keygen -A

RUN printf '%s\n' \
    '<!DOCTYPE html>' \
    '<html><head><meta charset="utf-8"><title>OpenSpace</title></head>' \
    '<body><h1>OpenSpace</h1><p>Container prêt.</p></body></html>' \
    > /var/www/html/index.html \
    && chown webuser:webuser /var/www/html/index.html

COPY nginx.conf /etc/nginx/sites-available/default
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/default \
    && nginx -t

COPY start.sh /start.sh
RUN chmod +x /start.sh

EXPOSE 22 80

CMD ["/start.sh"]
