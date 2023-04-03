fx_version "adamant"
games { "gta5" }

shared_script '@dg-core/import.js'

server_scripts {
  "server/*.js",
}

client_scripts {
  "@dg-logs/client/cl_log.lua",
  "client/*.js",
}

dependency "dg-auth"

files {
  'ui/index.html',
  'ui/dist/ui.js'
}

ui_page 'ui/index.html'