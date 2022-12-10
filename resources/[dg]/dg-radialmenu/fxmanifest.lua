fx_version "cerulean"
games {"gta5"}

shared_script '@dg-core/import.js'

ui_page 'html/index.html'

server_scripts {
  "server/*.js",
}

client_scripts {
  "@dg-logs/client/cl_log.lua",
  "client/*.js",
}

files {
  'html/index.html',
  'html/main.css',
  'html/js/*.js',
}

dependency "dg-auth"
