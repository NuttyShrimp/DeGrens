fx_version 'cerulean'
game 'gta5'

shared_script {
  '@dg-core/import.lua',
  '@dg-core/import.js',
  '@ts-shared/shared/lib.lua'
}

client_scripts {
  '@ts-shared/client/client.js',
	'@dg-lib/client/cl_ui.lua',
  "@dg-logs/client/cl_log.lua",
	'client/cl_*.lua',
}

server_script {
  '@ts-shared/server/server.js',
  "@dg-logs/server/sv_log.lua",
	'./sv_config.lua',
	'server/sv_*.lua'
}

dependency "dg-auth"
