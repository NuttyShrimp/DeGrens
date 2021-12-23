fx_version 'cerulean'
game 'gta5'

description 'dg-inventory'

shared_scripts { 
	'config.lua',
	'@dg-weapons/config.lua',
}

client_script {
    'client/*.lua'
}

server_scripts {
    'server/*.lua'
}

ui_page {
	'html/ui.html'
}

files {
	'html/ui.html',
	'html/css/main.css',
	'html/js/app.js',
	'html/images/*.png',
	'html/images/*.jpg',
	'html/ammo_images/*.png',
	'html/attachment_images/*.png',
	'html/*.ttf',
    'items.json',
}

provide 'qb-inventory'
