fx_version "cerulean"
games { "gta5" }


server_scripts {
  "server/*.js",
}

client_scripts {
  "@dg-logs/client/cl_log.lua",
  "client/*.js",
}

ui_page "html/index.html"

files {
  'html/index.html',
  'html/sounds/*.ogg'
}


dependency "dg-auth"
