FROM node:18-alpine

WORKDIR /usr/src/app

COPY ./dist/cluster /usr/src/app/cluster
COPY ./dist/bot /usr/src/app/bot
COPY ./dist/plugins /usr/src/app/plugins
COPY ./dist/shared /usr/src/app/shared
COPY ./dist/data /usr/src/app/data
COPY ./package*.json /usr/src/app/
COPY ./yarn.lock /usr/src/app/
COPY ./node_modules /usr/src/app/node_modules

CMD ["node", "/usr/src/app/cluster/index.js"]