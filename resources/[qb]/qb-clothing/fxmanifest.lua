fx_version 'cerulean'
game 'gta5'

description 'QB-Clothing'
version '1.0.0'

ui_page 'html/index.html'

shared_scripts { 
	'@dg-core/import.lua',
	'config.lua'
}

server_script 'server/main.lua'
client_scripts {
  '@ts-shared/shared/lib.lua',
  '@ts-shared/client/client.js',
  'client/main.lua',
}

files {
	'html/index.html',
	'html/style.css',
	'html/reset.css',
	'html/script.js'
}

dependencies {
	'dg-core'
}