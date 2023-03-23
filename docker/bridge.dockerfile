FROM node:18-alpine

ENV BRIDGE_PORT=4444

WORKDIR /usr/src/app

COPY ./dist/bridge /usr/src/app/bridge
COPY ./dist/shared /usr/src/app/shared
COPY ./package*.json /usr/src/app/
COPY ./yarn.lock /usr/src/app/
COPY ./node_modules /usr/src/app/node_modules

EXPOSE ${BRIDGE_PORT}

CMD ["node", "/usr/src/app/bridge/index.js"]