fx_version 'cerulean'
game 'gta5'

description 'QB-TunerChip'
version '1.0.0'

ui_page 'html/index.html'

shared_scripts { 
	'@dg-core/import.lua',
	'config.lua',
    '@ts-shared/shared/lib.lua'
}

client_scripts {
    "@ts-shared/client/client.js",
    'client/main.lua',
    'client/nos.lua'
}

server_script {
    "@ts-shared/server/server.js",
    'server/main.lua'
}

files {
    'html/*',
}