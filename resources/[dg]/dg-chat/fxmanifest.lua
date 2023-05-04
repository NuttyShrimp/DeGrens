fx_version "cerulean"
games { "gta5" }


server_scripts {
  "server/*.js",
}

client_scripts {
  "@dg-logs/client/cl_log.lua",
  "client/*.js",
}

ui_page 'ui/dist/index.html'

files {
  'ui/dist/index.html',
  'ui/dist/assets/*'
}

dependency "dg-auth"
