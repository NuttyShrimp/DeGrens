fx_version 'cerulean'
game 'gta5'

description 'QB-Clothing'
version '1.0.0'

ui_page 'html/index.html'

shared_scripts { 
	'config.lua'
}

server_scripts {
  '@ts-shared/shared/lib.lua',
  '@ts-shared/server/server.js',
  'server/main.lua'
}
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