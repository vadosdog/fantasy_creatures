#!/bin/sh

npm install
npm run dev-nolog
#if [ "$APP_ENV" = "local" ]; then
#  npm run dev-nolog
#fi
