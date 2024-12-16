#!/bin/bash

source .env

cd backend/
npm install
docker build -t app .

docker run -p $WS_PORT:$WS_PORT -d -e WS_HOST=$WS_HOST -e WS_PORT=$WS_PORT --name app_c app

cd ..
cd frontend/
npm install
VITE_WS_HOST=$WS_HOST VITE_WS_PORT=$WS_PORT npm run build
sudo cp -r dist/* /var/www/html
sudo cp -r src/assets/* /var/www/html/src/assets
cd ..