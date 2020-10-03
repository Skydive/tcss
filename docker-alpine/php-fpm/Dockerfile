FROM alpine:3.8

MAINTAINER Timothy Aleem timothy@precess.io

ENV UID 1000
ENV GID 1000

RUN \
	apk --update --no-cache \
	add shadow bash vim \
	php7 \
	php7-fpm \
	php7-mysqlnd \
	php7-mysqli \
	php7-pdo \
	php7-pdo_mysql \
	php7-pdo_pgsql \
	php7-curl \
	php7-zip \
	php7-json \
	php7-opcache \
	php7-fileinfo && \
	groupadd -g $GID http && \
	useradd	 -g $GID -u $UID -r -M http

EXPOSE 9000

CMD ["php-fpm7", "-F", "-c", "/data/php-fpm/config/php.ini", "-y", "/data/php-fpm/config/php-fpm.conf"]