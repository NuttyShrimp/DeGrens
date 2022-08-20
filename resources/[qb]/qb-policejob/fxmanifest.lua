fx_version 'cerulean'
game 'gta5'

description 'QB-PoliceJob'
version '1.0.0'

shared_scripts {
    'config.lua',
    '@ts-shared/shared/lib.lua'
}

client_scripts {
    '@ts-shared/client/client.js',
	'client/main.lua',
	'client/camera.lua',
	'client/interactions.lua',
	'client/job.lua',
	'client/gui.lua',
	'client/heli.lua',
	--'client/anpr.lua',
	'client/evidence.lua',
	'client/objects.lua',
	'client/tracker.lua'
}

server_scripts {
  '@ts-shared/server/server.js',
  'server/main.lua',
}

ui_page 'html/index.html'

files {
	'html/index.html',
	'html/vue.min.js',
	'html/script.js',
	'html/tablet-frame.png',
	'html/fingerprint.png',
	'html/main.css',
	'html/vcr-ocd.ttf'
}