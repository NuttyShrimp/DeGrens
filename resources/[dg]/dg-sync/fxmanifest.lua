fx_version 'cerulean'
game 'gta5'

client_script '@ts-shared/client/client.js'
server_script '@ts-shared/server/server.js'
shared_script '@ts-shared/shared/lib.lua'

client_scripts {
  '@dg-logs/client/cl_error.lua',
  'client/cl_*.lua',
  'client/lib.lua',
}

server_scripts {
  'server/sv_*.lua',
}

client_script "@dg-logs/client/cl_log.lua"

server_script "@dg-logs/server/sv_log.lua"
