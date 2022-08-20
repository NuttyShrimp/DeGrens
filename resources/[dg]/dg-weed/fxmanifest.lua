fx_version 'cerulean'
game 'gta5'

shared_scripts { 
    '@dg-core/import.lua', 
    '@ts-shared/shared/lib.lua'
}

client_script {
    "@ts-shared/client/client.js",
    'client/cl_*.lua',
    '@dg-lib/client/cl_ui.lua'
}

server_scripts {
    "@ts-shared/server/server.js",
    'server/sv_*.lua'
}

client_script "@dg-logs/client/cl_log.lua"

server_script "@dg-logs/server/sv_log.lua"
