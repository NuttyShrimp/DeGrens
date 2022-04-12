fx_version "cerulean"
game "gta5"

shared_scripts {
    '@dg-core/import.lua', 
}

client_scripts {
    'client/cl_*.lua',
}

server_scripts {
    'server/sv_*.lua',
    'config.lua',
}

exports {
    'GetNpc',
    'RemoveNpc',
    'DisableNpc',
    'EnableNpc',
    'UpdateNpc',
}