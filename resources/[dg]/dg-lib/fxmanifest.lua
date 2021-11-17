fx_version "cerulean"
games {"gta5"}

description "DeGrens Lib"

server_scripts {
	"server/sv_*.lua",
	"server/sv_*.js",
}

client_scripts {
	"client/cl_*.lua",
	"client/cl_*.js",
	"client/**/*.lua",
	"client/**/*.ytyp"
}

ui_page "ui/index.html"
files {
	"ui/index.html",
	'ui/**/*.js',
	'ui/**/*.css',
}