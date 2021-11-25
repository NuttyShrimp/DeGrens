fx_version 'cerulean'
game 'gta5'

description 'DG-Spawn'
version '1.0.0'

shared_scripts {
	'@qb-houses/config.lua',
}

client_scripts {
	'config.lua',
	'client.lua'
}

server_script 'server.lua'

ui_page 'html/index.html'

files {
	'html/index.html',
	'html/style.css',
	'html/script.js',
	'html/reset.css'
}

dependencies {
	'dg-core',
	'qb-houses',
	'qb-interior',
	'dg-apartments'
}