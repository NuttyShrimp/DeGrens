fx_version 'cerulean'
game 'gta5'

description 'dg-weapons'
version '1.0.0'

shared_scripts { 
	'config.lua'
}

client_script {
    "@dg-lib/client/cl_ui.lua",
    'client/*.lua'
}
server_script {
    'server/*.lua'
}

ui_page 'html/index.html'

files {
    'weaponsnspistol.meta',
    'html/index.html',
    'html/js/script.js',
    'html/css/style.css',
}

data_file 'WEAPONINFO_FILE_PATCH' 'weaponsnspistol.meta'