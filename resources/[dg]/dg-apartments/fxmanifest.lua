fx_version 'cerulean'
game 'gta5'

shared_script 'config.lua'

server_scripts {
	"server/sv_*.lua"
}

client_scripts {
	"@dg-logs/client/cl_log.lua",
	"client/cl_*.lua"
}