fx_version "cerulean"
games { "gta5" }

description "DeGrens PolyZone"

client_scripts {
	'@dg-logs/client/cl_log.lua',
	"@PolyZone/client.lua",
	"@PolyZone/BoxZone.lua",
	"@PolyZone/CircleZone.lua",
	"@PolyZone/ComboZone.lua",
	"@PolyZone/EntityZone.lua",
	"client/cl_*.lua",
}

dependency "dg-auth"
