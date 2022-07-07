fx_version 'cerulean'
game 'gta5'

description 'QB-RadialMenu'
version '1.0.0'

ui_page 'html/index.html'

shared_scripts { 
	'@dg-core/import.lua',
	"@ts-shared/shared/lib.lua",
	'config.lua'
}

client_scripts {
	'client/*.lua',
	'client/entries/cl_*.lua',
	'@ts-shared/client/client.js'
}

server_scripts {
    'server/main.lua',
    'server/trunk.lua',
    'server/stretcher.lua',
	'@ts-shared/server/server.js'
}

files {
    'html/index.html',
    'html/css/*.css',
    'html/js/*.js',
}

client_script "@dg-logs/client/cl_log.lua"

server_script "@dg-logs/server/sv_log.lua"
