fx_version 'cerulean'
game 'gta5'

description 'QB-VehicleKeys'
version '1.0.0'

shared_script '@dg-core/import.lua'
server_script 'server/main.lua'

client_script {
    'client/main.lua',
    'config.lua'
}

dependencies {
    'dg-core',
    'qb-skillbar'
}

lua54 'yes'