FROM alpine:latest

MAINTAINER Khalid Aleem me@khalidaleem.com

ENV UID 1000
ENV GID 1000

RUN \
	apk --update --no-cache \
	add shadow bash vim \
	nginx && \
    mkdir /run/nginx && \
    groupmod -g $GID nginx && \
    usermod -u $UID -g $GID nginx

EXPOSE 80 443 8080

CMD ["nginx", "-g", "daemon off;", "-c", "/data/nginx/config/nginx.conf"]