# DeGrens RP 2.0

> [!IMPORTANT]
> This repo is for archival reasons only hence why their is no issues tab

## Dependencies

- NodeJS
- pnpm
- MariaDB (We use mariaDB specific queries so a MySQL instance wil not work)

## How to setup

go to /config folder and copy the `-template.cfg` files

- mysql.cfg
  - change the convar string after "mysql_connection_string"
- server.cfg
  - place your CFX token between the "'s after "sv_licenseKey" 
  - get your Steam API key [here](https://steamcommunity.com/dev/apikey) and put it between the "'s after the "steam_webApiKey"

Next go to `/packages/db`` and copy the `.env.template` to `.env` and set your database URL to get the DB migrations working

Now run `pnpm install` in the root of the repo

Following with going to `/packages/db` and running `pnpm db:generate` there

Now run `pnpm build` for a production build or `pnpm build:dev` for a development build in the root of the repo

Now you just gotta start the server via your favorite tool/script

## Where are the assets

Well in our original Code base those where stored in separete git submodules which contain private assets we bought or had an subscription on and aren't thus allowed to redistribute