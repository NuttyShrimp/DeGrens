fx_version 'cerulean'
game 'gta5'

description 'QB-VehicleFailure'
version '1.0.0'

shared_scripts { 
	'@dg-core/import.lua',
	'config.lua',
    '@ts-shared/shared/lib.lua'
}

server_script {
    "@ts-shared/server/server.js",
    'server.lua'
}
client_script {
    "@ts-shared/client/client.js",
    'client.lua',
}