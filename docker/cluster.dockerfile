FROM node:18-alpine as builder

WORKDIR /usr/src/app

COPY ./package*.json ./yarn.lock /usr/src/app/
RUN yarn install

COPY ./ /usr/src/app
RUN yarn build:cluster && yarn build:bot && yarn build:plugins

FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist/cluster /usr/src/app/dist/cluster
COPY --from=builder /usr/src/app/dist/bot /usr/src/app/dist/bot
COPY --from=builder /usr/src/app/dist/plugins /usr/src/app/plugins
COPY --from=builder /usr/src/app/dist/shared /usr/src/app/dist/shared
COPY --from=builder /usr/src/app/package*.json /usr/src/app/
COPY --from=builder /usr/src/app/yarn.lock /usr/src/app/
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules

COPY ./data/bot /usr/src/app/data/bot

CMD ["node", "/usr/src/app/dist/cluster/index.js"]