FROM node:18-alpine

WORKDIR /usr/src/app

COPY ./dist/cluster /usr/src/app/dist/cluster
COPY ./dist/bot /usr/src/app/dist/bot
COPY ./dist/plugins /usr/src/app/plugins
COPY ./dist/shared /usr/src/app/dist/shared
COPY ./package*.json /usr/src/app/
COPY ./yarn.lock /usr/src/app/
COPY ./node_modules /usr/src/app/node_modules

COPY ./data/bot /usr/src/app/data/bot

CMD ["node", "/usr/src/app/dist/cluster/index.js"]