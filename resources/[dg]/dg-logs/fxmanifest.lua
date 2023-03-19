fx_version 'cerulean'
game 'gta5'

description 'dg-logs'
version '1.0.0'

server_scripts {
  '@ts-shared/shared/lib.lua',
  '@ts-shared/server/server.js',
  '@dg-core/import.js',
  '@dg-core/import.lua',
  'server/*.lua',
  'config.lua'
}

client_scripts {
	'client/cl_*.lua'
}

