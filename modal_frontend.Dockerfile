FROM node:20-bookworm

WORKDIR /app

ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY client/package*.json /app/client/
RUN cd /app/client && npm install

COPY client /app/client
RUN cd /app/client && npm run build

RUN npm install -g serve

WORKDIR /app/client
