FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 4003

CMD npx wait-on tcp:mysql:3306 && npm start
