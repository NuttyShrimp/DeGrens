fx_version 'cerulean'
game 'gta5'

ui_page 'ui/dist/index.html'

files {
	'ui/dist/index.html',
	'ui/dist/assets/*.css',
	'ui/dist/assets/*.js',
	'ui/dist/assets/*.png',
}

shared_script 'shared/sh_core.lua'

client_scripts {
	'client/cl_*.lua',
}

server_script {
	'server/sv_*.lua'
}