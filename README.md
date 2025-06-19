# gatekeeper-events

## Overview

**gatekeeper-events** is a containerized web application stack for managing events, built with Next.js and PostgreSQL. It includes automated database backups and supports file uploads.

## Project Structure

- `docker-compose.yml` — Orchestrates the services: database, backup, and Next.js app.
- `db_backup/` — Contains scripts and Dockerfile for automated PostgreSQL backups.
- `next-app/` — The Next.js application (not included in this repo snapshot).
- `data/` — Host-mounted volumes for persistent storage:
  - `public_uploads/` — Publicly accessible uploads.
  - `private_storage/` — Private storage for the app.
  - `postgres/` — PostgreSQL data directory.
  - `backups/` — Database backup files.

## Services

- **database**: PostgreSQL database with persistent storage and health checks.
- **db_backup**: Cron-based backup service for the database, storing compressed SQL dumps.
- **next-app**: Next.js frontend/backend, connected to the database and supporting file uploads.

## Usage

### Prerequisites

- Docker and Docker Compose installed

### Running the Stack

```sh
docker compose up -d
```

### Database Backups

- Backups are created automatically by the `db_backup` service (default: daily at 3 AM).
- Backup files are stored in `data/backups/` on the host.

#### Restoring a Backup

1. Copy the desired backup file to your database container or host.
2. Run:

   ```sh
   psql -U gatekeeper -d gatekeeper < /backups/{backup_file}.sql
   ```

   (See `db_backup/restore.txt` for an example.)

## Environment Variables

Sensitive credentials are set in `docker-compose.yml` for each service. Adjust as needed for your environment.

## Customization

- Change backup schedule: Edit `CRON_SCHEDULE` in `docker-compose.yml` under `db_backup`.
- Adjust volume paths as needed for your host system.

## License

This software is protected by copyright and is not licensed for any use. You may not use, reproduce, modify, distribute, or create derivative works of this code without explicit permission from the author.
