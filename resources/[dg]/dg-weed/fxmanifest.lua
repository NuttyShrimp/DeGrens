fx_version 'cerulean'
game 'gta5'

shared_scripts { 
	'config.lua',
    '@dg-core/import.lua', 
}

client_script {
    'client/cl_*.lua',
    '@dg-lib/client/cl_ui.lua'
}

server_scripts {
    'server/sv_*.lua'
}

client_script "@dg-logs/client/cl_log.lua"
