FROM node:20-bookworm

WORKDIR /app

COPY server/package*.json /app/server/

RUN cd /app/server && npm install

COPY server /app/server

RUN cd /app/server && npm run build
