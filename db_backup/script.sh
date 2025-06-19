#!/bin/sh
# Backup PostgreSQL database

echo " "
echo "---------------------------------------------------"
echo "Starting backup at $(date)"

# Read environment variables
DATE=$(date +"%m-%d-%Y_%H-%M-%S")
BACKUP_FILE="${DATE}.sql"

PG_COLOR=always

# Perform the backup
pg_dump -d "$DB_NAME" --data-only --no-owner | gzip > "/backups/${BACKUP_FILE}.gz"

echo "Backup completed at ${DATE}: $BACKUP_FILE"
echo "---------------------------------------------------"
