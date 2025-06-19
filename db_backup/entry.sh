#!/bin/sh

echo "Starting cron job..."

# start cron
/usr/sbin/crond -f -l 8

echo "Cron job started"