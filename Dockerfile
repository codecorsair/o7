FROM node:lts-alpine AS build

WORKDIR /app

COPY package.json yarn.lock /app/

RUN yarn install

COPY . .

RUN yarn build

FROM node:lts-alpine

WORKDIR /app

COPY --from=build /app/dist /app/dist
COPY --from=build /app/node_modules  /app/node_modules

CMD ["node", "/app/dist/index.js"]
