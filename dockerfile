from node:22.15.1
workdir /usr/src/api
copy package.json .
copy .env .
run npm install --only=prod
