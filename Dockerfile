FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci 

COPY . . 

EXPOSE 3002

CMD ["node","server.js"]

