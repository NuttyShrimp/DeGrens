fx_version 'cerulean'
game 'gta5'

ui_page 'html/index.html'

files {
    'html/index.html',
    'html/css/menu.css',
    'html/js/ui.js',
    'html/sounds/wrench.ogg',
    'html/sounds/respray.ogg'
}

shared_scripts { 
	'config.lua'
}

client_scripts {
    'client/cl_ui.lua',
    'client/cl_bennys.lua'
}

server_script 'server/sv_bennys.lua'