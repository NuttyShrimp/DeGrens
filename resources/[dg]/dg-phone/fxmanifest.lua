fx_version 'cerulean'
game 'gta5'

shared_script 'shared/sh_core.lua'

client_scripts {
	'@dg-lib/client/cl_ui.lua',
	'client/cl_*.lua',
}

server_script {
	'./sv_config.lua',
	'server/sv_*.lua'
}