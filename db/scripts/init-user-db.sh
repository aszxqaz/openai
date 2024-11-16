#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
	CREATE USER nonroot WITH PASSWORD 'iNl4t4T9RGST4q7p11u6';
	CREATE DATABASE openai;
	GRANT ALL PRIVILEGES ON DATABASE openai TO nonroot;
EOSQL