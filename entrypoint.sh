#!/bin/bash

# This file is for docker image

set -e


echo "Nuking database"
rm -f ${MAKYO_DB_PATH} 

echo "Migrating database"
bun run drizzle:migrate

echo "Seeding database"
bun run drizzle:seed

echo "Starting server"
bun run server/index.ts
