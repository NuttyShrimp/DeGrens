fx_version 'cerulean'
game 'gta5'

shared_scripts { 
    '@dg-core/import.lua', 
	'config.lua',
}

client_script {
    'client/cl_*.lua'
}

server_scripts {
    'server/sv_*.lua'
}
