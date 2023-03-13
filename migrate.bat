pushd %~dp0

cd packages/db

pnpm install --frozen-lockfile && pnpm db:migrate
