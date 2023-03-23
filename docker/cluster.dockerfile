FROM node:18-alpine

WORKDIR /usr/src/app

COPY ./dist/src/cluster /usr/src/app/cluster
COPY ./dist/src/bot /usr/src/app/bot
COPY ./dist/src/plugins /usr/src/app/plugins
COPY ./dist/src/shared /usr/src/app/shared
COPY ./package*.json /usr/src/app/
COPY ./yarn.lock /usr/src/app/
COPY ./node_modules /usr/src/app/node_modules

COPY ./dist/data /usr/src/app/data

CMD ["node", "/usr/src/app/cluster/index.js"]