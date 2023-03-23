FROM node:18-alpine

WORKDIR /usr/src/app

COPY ./dist/bridge /usr/src/app/bridge
COPY ./dist/shared /usr/src/app/shared
COPY ./package*.json /usr/src/app/
COPY ./yarn.lock /usr/src/app/
COPY ./node_modules /usr/src/app/node_modules

CMD ["node", "/usr/src/app/bridge/index.js"]