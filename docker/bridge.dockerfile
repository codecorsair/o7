FROM node:18-alpine as builder

WORKDIR /usr/src/app

COPY ./package*.json ./yarn.lock /usr/src/app/
RUN yarn install

COPY ./ /usr/src/app
RUN yarn build:bridge

FROM node:18-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist/bridge /usr/src/app/dist/bridge
COPY --from=builder /usr/src/app/dist/shared /usr/src/app/dist/shared
COPY --from=builder /usr/src/app/package*.json /usr/src/app/
COPY --from=builder /usr/src/app/yarn.lock /usr/src/app/
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules

CMD ["node", "/usr/src/app/dist/bridge/index.js"]