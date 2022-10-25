fx_version 'cerulean'
game 'gta5'

description 'dg-core'
version '1.0.0'

shared_scripts {
  "@ts-shared/shared/lib.lua",
	'import.lua',
	"import.js",
	'config.lua',
	'shared.lua'
}

client_scripts {
  "@ts-shared/client/client.js",
	'@dg-logs/client/cl_log.lua',
	'@dg-lib/client/cl_ui.lua',
	'client/main.lua',
	'client/functions.lua',
	'client/loops.lua',
	'client/events.lua',
  'client/blipmanager.lua',
}

server_scripts {
  "@ts-shared/server/server.js",
	'server/main.lua',
	'server/functions.lua',
	'server/player.lua',
	'server/events.lua',
	'server/commands.lua',
	'server/debug.lua'
}

dependencies {
	'dg-sql',
	'connectqueue'
}

lua54 'yes'
