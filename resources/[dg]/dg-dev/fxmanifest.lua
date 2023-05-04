fx_version 'cerulean'
games {'gta5'}

shared_scripts {
  "@ts-shared/shared/lib.lua",
}

server_scripts {
  "@ts-shared/server/server.js",
  "@dg-logs/server/sv_log.lua",
	"server/**/*.lua",
	"server/**/*.js"
}

client_scripts {
  "@ts-shared/client/client.js",
	"@dg-logs/client/cl_log.lua",
	"client/**/*.lua",
	"client/**/*.js"
}

dependency "dg-auth"
