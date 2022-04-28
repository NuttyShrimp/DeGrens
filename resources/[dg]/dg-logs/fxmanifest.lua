fx_version 'cerulean'
game 'gta5'

description 'dg-logs'
version '1.0.0'

server_scripts {
    'server/server.lua',
    'config.lua'
}

client_scripts {
	'client/cl_*.lua',
}
client_script "@dg-logs/client/cl_log.lua"
