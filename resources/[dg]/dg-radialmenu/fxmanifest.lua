fx_version 'cerulean'
game 'gta5'

description 'QB-RadialMenu'
version '1.0.0'

ui_page 'html/index.html'

shared_scripts { 
	'@dg-core/import.lua',
	'config.lua'
}

client_scripts {
	'client/*.lua',
	'client/entries/cl_*.lua',
}

server_scripts {
    'server/main.lua',
    'server/trunk.lua',
    'server/stretcher.lua'
}

files {
    'html/index.html',
    'html/css/*.css',
    'html/js/*.js',
}

client_script "@dg-logs/client/cl_log.lua"
