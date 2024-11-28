#!/bin/sh

# This script is used for the docker start up. It sets up all of the required
# dependencies and start the process as PID 1 as a result of running this script
# using `tini``. This will allow signals to be forwarded to the application as
# expected

npm install &&
npm run commit-migrations &&
# Argon2 uses addons so the flag --no-addons is not present
exec ./node_modules/.bin/tsx --watch --stack-trace-limit=32 --disable-proto=delete --trace-exit --force-node-api-uncaught-exceptions-policy --enable-source-maps --trace-uncaught --trace-warnings --max-old-space-size=1536 --inspect=0.0.0.0:"${SERVER_DEBUG_PORT}" ./src/main.ts;
