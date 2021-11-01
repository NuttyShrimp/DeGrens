fx_version 'cerulean'
game 'gta5'


loadscreen 'html/index.html'
loadscreen_manual_shutdown 'yes'

client_script '@dg-logs/client/cl_error.lua'
client_script 'client/cl_main.lua'

files {
    'html/index.html',
    'html/stylesheet.css',
    'html/imgs/logo.png',
		'html/imgs/bg.jpg',
    'html/js/app.js',
		'html/js/progressbar-handler.js',
		'html/js/progressbar-main.js',
		'html/js/progressbar-renderer.js'
}