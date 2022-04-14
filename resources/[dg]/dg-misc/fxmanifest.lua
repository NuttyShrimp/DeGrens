fx_version "cerulean"
games {"gta5"}

description "DeGrens Misc"

shared_script '@dg-core/import.lua'

client_scripts {
	'@dg-logs/client/cl_log.lua',
	'@dg-lib/client/cl_ui.lua',
	"client/cl_*.lua",
}