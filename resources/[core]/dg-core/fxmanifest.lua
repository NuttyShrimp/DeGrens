fx_version 'cerulean'
game 'gta5'

description 'dg-core'
version '1.0.0'

shared_scripts {
	'import.lua',
	"import.js",
	'config.lua',
	'shared.lua'
}

client_scripts {
	'@dg-logs/client/cl_log.lua',
	'@dg-lib/client/cl_ui.lua',
	'client/main.lua',
	'client/functions.lua',
	'client/loops.lua',
	'client/events.lua'
}

server_scripts {
	'server/main.lua',
	'server/functions.lua',
	'server/player.lua',
	'server/events.lua',
	'server/commands.lua',
	'server/debug.lua'
}

dependencies {
	'oxmysql',
	'progressbar',
	'connectqueue'
}

lua54 'yes'
