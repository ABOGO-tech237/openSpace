#!/bin/bash
set -e

mkdir -p /run/sshd

/usr/sbin/php-fpm8.2 --daemonize --fpm-config /etc/php/8.2/fpm/php-fpm.conf
/usr/sbin/sshd

exec nginx -g "daemon off;"
