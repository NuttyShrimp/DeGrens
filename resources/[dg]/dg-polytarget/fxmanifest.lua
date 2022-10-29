fx_version "cerulean"
games { "gta5" }

description "DeGrens Polytarget"

client_scripts {
	'@dg-logs/client/cl_log.lua',
	"@PolyZone/client.lua",
	"@PolyZone/BoxZone.lua",
	"@PolyZone/CircleZone.lua",
	"@PolyZone/ComboZone.lua",
	"@PolyZone/EntityZone.lua",
	"client/cl_*.lua",
  '@ts-shared/shared/lib.lua',
  "@ts-shared/client/client.js",
}
