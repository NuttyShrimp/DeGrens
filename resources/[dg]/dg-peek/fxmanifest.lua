fx_version "cerulean"
game "gta5"

description "DG-Peek"

ui_page "html/index.html"

client_scripts {
	'@dg-logs/client/cl_log.lua',
	"config.lua",
	"client/cl_*.lua",
}

files {
	"html/*.html",
	"html/css/*.css",
	"html/js/*.js"
}

dependency "PolyZone"