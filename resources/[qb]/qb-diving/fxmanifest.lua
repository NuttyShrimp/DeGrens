fx_version 'cerulean'
game 'gta5'

description 'QB-Diving'
version '1.0.0'

shared_scripts { 
	'@dg-core/import.lua',
    '@ts-shared/shared/lib.lua',
	'config.lua'
}

server_scripts {
    "@ts-shared/server/server.js",
	'server/main.lua',
    'server/diving.lua'
}

client_scripts {
    "@ts-shared/client/client.js",
    'client/main.lua',
    'client/boatshop.lua',
    'client/diving.lua',
    'client/garage.lua',
    'client/gui.lua',
    'client/shop.lua'
}