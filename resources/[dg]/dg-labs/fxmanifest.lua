fx_version 'cerulean'
game 'gta5'

shared_scripts { 
    '@dg-core/import.lua',
	'config.lua',
}

client_script {
    '@dg-lib/client/cl_ui.lua',
    'client/cl_*.lua'
}

server_scripts {
    'server/sv_*.lua'
}

files {
	"./labs.json"
}
client_script "@dg-logs/client/cl_log.lua"
