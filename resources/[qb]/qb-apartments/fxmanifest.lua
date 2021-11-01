fx_version 'cerulean'
game 'gta5'

description 'QB-Apartments'
version '1.0.0'

shared_script 'config.lua'

server_script 'server/main.lua'

client_scripts {
	'client/main.lua',
	'client/gui.lua'
}

dependencies {
	'dg-core',
	'qb-interior',
	'qb-clothing',
	'dg-weathersync'
}

lua54 'yes'