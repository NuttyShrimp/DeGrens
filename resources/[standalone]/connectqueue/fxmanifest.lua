fx_version 'cerulean'
game 'common'

shared_scripts {
  '@dg-core/import.lua',
  '@ts-shared/shared/lib.lua'
}

client_scripts {
  "@ts-shared/client/client.js",
  "shared/sh_queue.lua"
}

server_scripts {
  "@ts-shared/server/server.js",
  "server/sv_queue_config.lua",
  "connectqueue.lua",
  "shared/sh_queue.lua",
}
