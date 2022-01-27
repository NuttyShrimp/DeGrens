fx_version 'cerulean'
game 'gta5'

ui_page 'ui/dist/index.html'

files {
	'ui/dist/index.html',
	'ui/dist/assets/*',
	'ui/dist/icons/*',
}

shared_script 'shared/sh_core.lua'

client_scripts {
	'client/cl_*.lua',
}

server_script {
	'./sv_config.lua',
	'server/sv_*.lua'
}