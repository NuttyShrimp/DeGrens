fx_version "cerulean"
games { "gta5" }

server_scripts {
  "@dg-core/import.js",
  "server/*.js",
}

client_scripts {
  "client/*.js",
}

files {
  "ui/index.html",
  "ui/assets/*.js",
}

ui_page 'ui/index.html'