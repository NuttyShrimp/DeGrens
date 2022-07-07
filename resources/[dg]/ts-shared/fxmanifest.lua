fx_version "cerulean"
games {"gta5"}

server_scripts {
  '@dg-core/import.js',
  "server/*.js",
}

client_scripts {
  "@dg-logs/client/cl_log.lua",
  "client/*.js",
}

shared_script "shared/lib.lua"
