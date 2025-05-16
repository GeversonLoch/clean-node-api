from node:22.15.1
workdir /usr/src/api
copy package.json .
run npm install --only=prod
copy ./dist ./dist
expose 5000
cmd npm start
