fx_version 'cerulean'
game 'gta5'

shared_script {
  "@ts-shared/shared/lib.lua",
  '@dg-core/import.lua', 
  'config.lua'
}

server_scripts {
  "@ts-shared/server/server.js",
	"server/sv_*.lua",
}

client_scripts {
  "@ts-shared/client/client.js",
	"@dg-logs/client/cl_log.lua",
	"@dg-lib/client/cl_ui.lua",
	"client/cl_*.lua"
}