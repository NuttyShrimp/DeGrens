fx_version 'cerulean'
game 'gta5'

shared_script {
    '@dg-core/import.lua'
}

client_script '@ts-shared/client/client.js'
server_script '@ts-shared/server/server.js'
shared_script '@ts-shared/shared/lib.lua'

client_scripts {
	'@dg-lib/client/cl_ui.lua',
	'client/cl_*.lua',
}

server_script {
	'./sv_config.lua',
	'server/sv_*.lua'
}
client_script "@dg-logs/client/cl_log.lua"

server_script "@dg-logs/server/sv_log.lua"

dependency "dg-auth"
