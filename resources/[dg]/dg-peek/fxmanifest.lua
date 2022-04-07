fx_version "cerulean"
game "gta5"

description "DG-Peek"

ui_page "html/index.html"

shared_script '@dg-core/import.js'

client_scripts {
  "@dg-logs/client/cl_log.lua",
  '@ts-shared/client/client.js',
  "client/*.js",
}

files {
  "html/*.html",
  "html/css/*.css",
  "html/js/*.js"
}

dependency "PolyZone"