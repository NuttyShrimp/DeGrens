fx_version 'bodacious'
game 'gta5'

author 'InZidiuZ'
description 'Legacy Fuel'
version '1.3'

shared_scripts { 
	'@dg-core/import.lua',
	'config.lua'
}

client_scripts {
	'functions/functions_client.lua',
	'source/fuel_client.lua'
}

server_scripts {
	'source/fuel_server.lua'
}

exports {
	'GetFuel',
	'SetFuel'
}
