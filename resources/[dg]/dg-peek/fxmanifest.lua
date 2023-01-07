fx_version "cerulean"
game "gta5"

description "DG-Peek"

client_scripts {
  '@dg-core/import.js',
  "@dg-logs/client/cl_log.lua",
  "client/*.js",
}

dependency "dg-auth"
