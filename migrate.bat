pushd %~dp0

cd packages/db

yarn --frozen-lockfile && yarn db:migrate
