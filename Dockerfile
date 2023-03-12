FROM node:16.9.1 AS builder
WORKDIR /app
RUN yarn global add turbo
COPY ./resources/ resources/
COPY ./packages/ packages/
COPY ./patches/ patches/
COPY ["package.json", "yarn.lock", ".npmrc", "turbo.json", "."]

RUN turbo prune --scope="dg-ui" --docker

FROM node:16.9.1

WORKDIR /app

COPY ./.npmrc .
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/yarn.lock ./yarn.lock


RUN yarn config set network-timeout 600000 -g
RUN yarn --frozen-lockfile