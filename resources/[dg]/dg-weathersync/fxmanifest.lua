fx_version 'cerulean'
game 'gta5'

shared_script '@dg-core/import.js'

server_scripts {
  'dist/server/server.js',
}

client_scripts {
  "@dg-logs/client/cl_log.lua",
  'dist/client/client.js',
}

