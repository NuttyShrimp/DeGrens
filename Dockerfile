FROM node:16.9.1

WORKDIR /app

COPY ["package.json", "yarn.lock", ".npmrc", "./"]

RUN yarn --cache-folder cache/.yarn

RUN mv node_modules cache/