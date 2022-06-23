fx_version "cerulean"
games {"gta5"}

description "DeGrens Lib"

shared_script {
    '@dg-core/import.lua', 
}

server_scripts {
	"server/sv_*.lua",
	"server/sv_*.js",
}

client_scripts {
	'@dg-logs/client/cl_log.lua',
	"@PolyZone/client.lua",
	"@PolyZone/BoxZone.lua",
	"@PolyZone/CircleZone.lua",
	"@PolyZone/ComboZone.lua",
	"@PolyZone/EntityZone.lua",
	"client/cl_*.lua",
	"client/cl_*.js",
	"client/**/*.lua",
	"client/**/*.ymap.xml"
}