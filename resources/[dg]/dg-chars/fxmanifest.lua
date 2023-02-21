fx_version 'cerulean'
game 'gta5'

description 'DG Chars'

shared_scripts {
  '@ts-shared/shared/lib.lua',
  '@dg-core/import.lua',
  '@dg-core/import.js',
  'config.lua'
}

client_scripts {
  '@dg-logs/client/cl_log.lua',
  '@ts-shared/client/client.js',
	'client/cl_*.lua'
}

server_script {
  '@ts-shared/server/server.js',
	'sv_config.lua',
	'server/sv_*.lua',
  "@dg-logs/server/sv_log.lua"
}

ui_page 'ui/dist/index.html'

files {
	'ui/dist/index.html',
	'ui/dist/assets/*'
} 

dependency "dg-auth"
