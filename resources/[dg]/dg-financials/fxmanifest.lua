fx_version "cerulean"
games { "gta5" }

shared_script '@dg-core/import.js'

server_scripts {
  '@ts-shared/server/server.js',
  "server/*.js",
}

client_scripts {
  "@dg-logs/client/cl_log.lua",
  '@ts-shared/client/client.js',
  "client/*.js",
}

dependency "dg-auth"
