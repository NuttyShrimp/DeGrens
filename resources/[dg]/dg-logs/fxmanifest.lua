fx_version 'cerulean'
game 'gta5'

description 'dg-logs'
version '1.0.0'

shared_scripts {
  '@dg-core/import.js',
  '@dg-core/import.lua',
  '@ts-shared/shared/lib.lua',
}

server_scripts {
  '@ts-shared/server/server.js',
    'server/*.lua',
    'config.lua'
}

client_scripts {
  '@ts-shared/client/client.js',
	'client/cl_*.lua',
}

