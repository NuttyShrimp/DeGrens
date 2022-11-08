fx_version 'cerulean'
game 'gta5'


loadscreen 'html/index.html'
loadscreen_manual_shutdown 'yes'

client_script '@dg-logs/client/cl_log.lua'
client_script 'client/cl_main.lua'

files {
    'html/index.html',
    'html/stylesheet.css',
    'html/imgs/*',
    'html/js/app.js',
    'html/assets/*.mp4'
}