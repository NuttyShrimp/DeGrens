fx_version 'cerulean'
game 'gta5'
name 'dg-ui'

shared_script '@dg-core/import.lua'

server_scripts {
	'server/sv_*.lua',
}

client_scripts {
    '@ts-shared/client/client.js',
    '@ts-shared/shared/lib.lua',
	'@dg-logs/client/cl_log.lua',
	'client/cl_*.lua',
	'client/components/cl_*.lua',
}

ui_page "html/index.html"

files {
	"html/index.html",
	"html/favicon.ico",
	'html/assets/*',
}
