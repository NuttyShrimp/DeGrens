fx_version "cerulean"
games {"gta5"}

server_scripts {
  "server/*.js",
  "server/lib.lua",
}

server_script "@dg-logs/server/sv_log.lua"

dependency "dg-auth"
