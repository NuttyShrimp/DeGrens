fx_version 'cerulean'
game 'gta5'

description 'QB-SmallResources'
version '1.0.0'

shared_scripts { 
	'@dg-core/import.lua',
	'config.lua',
    '@ts-shared/shared/lib.lua'

}

server_script {
    "@ts-shared/server/server.js",
    'server/*.lua'
}
client_script {
    "@ts-shared/client/client.js",
    'client/*.lua',
}

data_file 'FIVEM_LOVES_YOU_4B38E96CC036038F' 'events.meta'
data_file 'FIVEM_LOVES_YOU_341B23A2F0E0F131' 'popgroups.ymt'

files {
	'events.meta',
	'popgroups.ymt',
	'relationships.dat'
}

exports {
	'HasHarness'
}
