fx_version 'adamant'

game 'gta5'

shared_scripts {
    '@ts-shared/shared/lib.lua'
}

client_scripts {
    "@ts-shared/client/client.js",
	'NativeUI.lua',
	'Config.lua',
	'Client/*.lua'
}

server_scripts {
    "@ts-shared/server/server.js",
	'Config.lua',
	'Server/*.lua'
}
