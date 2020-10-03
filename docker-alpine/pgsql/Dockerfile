FROM alpine:3.8

MAINTAINER Timothy Aleem timothy@precess.io

ENV UID 1000
ENV GID 1000

RUN \
	apk --update --no-cache \
	add shadow bash vim \
	postgresql && \
    groupmod -g $GID postgres && \
    usermod -u $UID -g $GID postgres

EXPOSE 5432
USER postgres
CMD ["postgres", "-D", "/data/pgsql/db"]
