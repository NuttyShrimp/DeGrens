fx_version 'cerulean'
game 'gta5'

description 'dg-inventory'

shared_scripts { 
	'config.lua',
	'@qb-weapons/config.lua',
}

server_scripts {
    'server/*.lua'
}
server_export "GetItemData"

client_script {
    'client/*.lua'
}
export "GetItemData"

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
}

provide 'qb-inventory'
