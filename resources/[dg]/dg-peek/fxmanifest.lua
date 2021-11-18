fx_version "cerulean"
game "gta5"

description "DG-Peek"

ui_page "html/index.html"

shared_scripts {
    "@qb-core/import.lua"
}

client_scripts {
	"@PolyZone/client.lua",
	"@PolyZone/BoxZone.lua",
	"@PolyZone/EntityZone.lua",
	"@PolyZone/CircleZone.lua",
	"@PolyZone/ComboZone.lua",
	"config.lua",
	"client/*.lua",
}

files {
	"html/*.html",
	"html/css/*.css",
	"html/js/*.js"
}

dependency "PolyZone"