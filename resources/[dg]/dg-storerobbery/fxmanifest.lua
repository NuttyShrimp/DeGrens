fx_version 'cerulean'
game 'gta5'

shared_scripts { 
	'config.lua',
}

client_script {
	'@dg-logs/client/cl_log.lua',
	'client/cl_*.lua'
}

server_scripts {
    'server/sv_*.lua'
}
