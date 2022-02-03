fx_version "cerulean"
games { "gta5" }

shared_scripts {
	'@dg-core/import.js'
}

server_scripts {
	"server/*.js",
}

client_scripts {
	"client/*.js",
}

ui_page "./ui/dist/index.html"

files {
	"./ui/dist/index.html",
	"./ui/dist/assets/*.js",
	"./ui/dist/assets/*.js.map",
	"./ui/dist/assets/*.css",
}