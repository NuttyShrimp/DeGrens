fx_version 'cerulean'
game 'gta5'

description 'QB-FitBit'
version '1.0.0'

ui_page 'html/index.html'

shared_scripts {
    '@dg-core/import.lua',
    '@ts-shared/shared/lib.lua'
}
server_script {
    "@ts-shared/server/server.js",
    'server/main.lua'
}
client_script {
    "@ts-shared/client/client.js",
    'client/main.lua',
}

files {
	'html/*'
}