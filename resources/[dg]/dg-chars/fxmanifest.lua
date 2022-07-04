fx_version 'cerulean'
game 'gta5'

description 'DG Chars'

shared_script '@dg-core/import.lua'
client_script '@dg-logs/client/cl_log.lua'
shared_script 'config.lua'
client_scripts {
	'client/cl_*.lua'
}
server_script {
	'sv_config.lua',
	'server/sv_*.lua'
}

ui_page 'ui/dist/index.html'

files {
	'ui/dist/index.html',
	'ui/dist/assets/*'
}

server_script "@dg-logs/server/sv_log.lua"
