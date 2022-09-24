fx_version "cerulean"
games {"gta5"}

shared_script '@dg-core/import.js'

server_scripts {
  "server/*.js",
}

client_scripts {
  "@dg-logs/client/cl_log.lua",
  "client/*.js",
}

files {
	'popgroups.ymt',
  'relationships.dat'
}

data_file 'FIVEM_LOVES_YOU_341B23A2F0E0F131' 'popgroups.ymt'