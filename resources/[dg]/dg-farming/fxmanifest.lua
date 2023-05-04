fx_version "cerulean"
games { "gta5" }


server_scripts {
  "server/*.js",
}

client_scripts {
  "@dg-logs/client/cl_log.lua",
  "client/*.js",
}

dependency "dg-auth"
