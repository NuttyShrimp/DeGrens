fx_version 'cerulean'
games {'gta5'}

shared_scripts {
  '@dg-core/import.lua', 
  "@ts-shared/shared/lib.lua",
}

server_scripts {
  "@ts-shared/server/server.js",
  "@dg-logs/server/sv_log.lua",
	"server/sv_*.lua",
}

client_scripts {
  "@ts-shared/client/client.js",
	"@dg-logs/client/cl_log.lua",
	"client/cl_*.lua",
}

dependency "dg-auth"
