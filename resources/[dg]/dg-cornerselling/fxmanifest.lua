fx_version 'cerulean'
game 'gta5'

shared_scripts { 
  '@dg-core/import.lua', 
	'config.lua',
	"@ts-shared/shared/lib.lua",
}

client_script {
  'client/cl_*.lua',
	"@ts-shared/client/client.js",
}

server_scripts {
  'server/sv_*.lua',
	"@ts-shared/server/server.js",
}

client_script "@dg-logs/client/cl_log.lua"

server_script "@dg-logs/server/sv_log.lua"
