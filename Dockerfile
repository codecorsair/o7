FROM node:lts-alpine AS build

WORKDIR /app

COPY package.json yarn.lock /app/

RUN yarn install

COPY . .

RUN yarn build

FROM node:lts-alpine

USER container
ENV  USER=container HOME=/home/container

WORKDIR /home/container/app

COPY --from=build /app/dist /home/container/app/dist
COPY --from=build /app/node_modules  /home/container/app/node_modules

CMD ["node", "/home/container/app/dist/index.js"]
