fx_version 'cerulean'
game 'gta5'

description 'QB-Houses'
version '1.0.0'

ui_page 'html/index.html'

shared_scripts {
    'config.lua',
    '@ts-shared/shared/lib.lua'
}

client_scripts {
    "@ts-shared/client/client.js",
	'client/main.lua',
	'client/gui.lua',
	'client/decorate.lua'
}

server_script {
    "@ts-shared/server/server.js",
    'server/main.lua'
}

files {
	'html/index.html',
	'html/reset.css',
	'html/style.css',
	'html/script.js',
	'html/img/dynasty8-logo.png'
}