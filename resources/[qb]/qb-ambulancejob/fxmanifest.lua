fx_version 'cerulean'
game 'gta5'

description 'QB-AmbulanceJob'
version '1.0.0'

shared_scripts {
    'config.lua',
    '@ts-shared/shared/lib.lua'
}

client_scripts {
    "@ts-shared/client/client.js",
	'client/main.lua',
	'client/wounding.lua',
	'client/laststand.lua',
	'client/job.lua',
	'client/dead.lua',
	'client/gui.lua',
}

server_scripts {
    "@ts-shared/server/server.js",
    'server/main.lua'
}

lua54 'yes'