fx_version 'cerulean'
game 'gta5'

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/css/style.css',
    'html/js/ui.js',
}

shared_scripts { 
	'config.lua'
}

client_scripts {
    'client/main.lua',
}

server_script {
	'server/main.lua'
}