fx_version 'cerulean'
game 'gta5'

shared_scripts {
  '@dg-core/import.lua', 
}

client_scripts {
  '@dg-logs/client/cl_log.lua',
	'client/cl_*.lua',
}

server_script {
  "@dg-logs/server/sv_log.lua",
  "server/sv_*.lua"
}

--dev
-- client_scripts {
-- 	'tools/cl_*.lua'
-- }
-- server_scripts {
-- 	'tools/sv_*.lua'
-- }
