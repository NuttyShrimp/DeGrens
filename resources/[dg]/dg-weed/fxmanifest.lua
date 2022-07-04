fx_version 'cerulean'
game 'gta5'

shared_scripts { 
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

server_script "@dg-logs/server/sv_log.lua"
