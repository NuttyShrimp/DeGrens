fx_version "cerulean"
game "gta5"

description "DG-Peek"

shared_script '@dg-core/import.js'

client_scripts {
  "@dg-logs/client/cl_log.lua",
  '@ts-shared/client/client.js',
  "client/*.js",
}

dependency "dg-auth"
