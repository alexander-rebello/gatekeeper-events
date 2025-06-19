# Use Alpine Linux as the base image
FROM alpine:latest

COPY script.sh /script.sh
COPY entry.sh /entry.sh

ARG CRON_SCHEDULE

RUN echo "$CRON_SCHEDULE /script.sh" > /crontab.txt

# Install PostgreSQL client
RUN apk update
RUN apk add gzip
RUN apk add postgresql-client

RUN chmod 755 /script.sh /entry.sh
RUN /usr/bin/crontab /crontab.txt

CMD ["/entry.sh"]