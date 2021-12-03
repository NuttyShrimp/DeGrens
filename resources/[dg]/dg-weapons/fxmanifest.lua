fx_version 'cerulean'
game 'gta5'

description 'dg-weapons'
version '1.0.0'

shared_scripts { 
	'config.lua'
}

client_script {
    'client/*.lua'
}
server_script {
    'server/*.lua'
}

files {
    'weaponsnspistol.meta',
}

data_file 'WEAPONINFO_FILE_PATCH' 'weaponsnspistol.meta'