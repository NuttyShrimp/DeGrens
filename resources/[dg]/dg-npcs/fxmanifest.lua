fx_version "cerulean"
game "gta5"

description 'Jens-CarBoosting'
version '1.0.0'

shared_scripts {
    '@qb-core/import.lua',
	'config.lua'
}

client_scripts {
    'client/*'
}

server_scripts {
    'server/*'
}

exports {
    'GetNpc',
    'RemoveNpc',
    'DisableNpc',
    'EnableNpc',
    'UpdateNpc',
}