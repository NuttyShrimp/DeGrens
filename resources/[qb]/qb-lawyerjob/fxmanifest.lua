fx_version 'cerulean'
game 'gta5'

description 'QB-Justice'
version '1.0.0'

shared_scripts {
    '@dg-core/import.lua',
}
server_script {
    "@ts-shared/server/server.js",
    '@ts-shared/shared/lib.lua',
    'server/main.lua'
}