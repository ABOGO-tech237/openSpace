FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV TZ=UTC

# Update system
RUN apt-get update && apt-get install -y \
    curl wget git vim nano htop \
    build-essential software-properties-common \
    apt-transport-https ca-certificates gnupg lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Install PHP 8.2
RUN add-apt-repository ppa:ondrej/php && \
    apt-get update && apt-get install -y \
    php8.2 php8.2-cli php8.2-fpm php8.2-mysql php8.2-pgsql \
    php8.2-redis php8.2-curl php8.2-gd php8.2-xml php8.2-zip \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js 20
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && rm -rf /var/lib/apt/lists/*

# Install Nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Install SSH
RUN apt-get update && apt-get install -y openssh-server openssh-client \
    && rm -rf /var/lib/apt/lists* && mkdir -p /run/sshd

# Create directories
RUN mkdir -p /var/www/html /var/www/data /home/openspace && \
    chmod 755 /var/www/html

# Nginx config
COPY nginx.conf /etc/nginx/sites-available/default

# SSH config
COPY sshd_config /etc/ssh/sshd_config.d/openspace.conf

# PHP config
RUN echo "memory_limit = 256M\nupload_max_filesize = 100M\npost_max_size = 100M\nmax_execution_time = 300" \
    > /etc/php/8.2/cli/conf.d/openspace.ini

# Create startup script
COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/ || exit 1

LABEL openspace.version="1.0" openspace.base="true"

EXPOSE 22 80 443 3000

WORKDIR /var/www/html

CMD ["/usr/local/bin/start.sh"]
