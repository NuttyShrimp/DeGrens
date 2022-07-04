fx_version 'cerulean'
game 'gta5'

client_scripts {
    '@dg-lib/client/cl_ui.lua',
    'client/cl_*.lua'
}

server_scripts {
    'server/sv_*.lua',
    '@ts-shared/server/server.js',
}

shared_scripts {
    '@dg-core/import.lua',
    '@ts-shared/shared/lib.lua',
	'config.lua'
}

client_script "@dg-logs/client/cl_log.lua"

server_script "@dg-logs/server/sv_log.lua"
