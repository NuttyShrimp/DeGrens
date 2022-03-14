fx_version 'cerulean'
game 'gta5'

ui_page 'html/build/index.html'

files {
	'html/build/index.html',
    'html/build/static/css/*.css',
    'html/build/static/js/*.js',
}

client_scripts {
    'client/cl_*.lua'
}

server_scripts {
    'server/sv_*.lua',
}

shared_scripts {
	'config.lua'
}
