#!/bin/bash

# This file is for docker image

set -e

echo "Migrating database"
bun run drizzle:migrate

echo "Starting server"
bun run server/index.ts
