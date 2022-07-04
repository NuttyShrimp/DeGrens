fx_version "cerulean"
games {"gta5"}

description "DeGrens Misc"

shared_script '@dg-core/import.lua'
shared_script '@ts-shared/shared/lib.lua'

client_scripts {
	'@dg-logs/client/cl_log.lua',
	'@dg-lib/client/cl_ui.lua',
	"client/cl_*.lua",
}

server_scripts {
  '@dg-logs/server/sv_log.lua',
  '@ts-shared/server/server.js',
  'server/sv_*.lua',
}