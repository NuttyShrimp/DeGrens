fx_version 'cerulean'
game 'gta5'
name 'dg-ui'

shared_scripts {
  '@dg-core/import.lua',
  '@dg-core/import.js',
  '@ts-shared/shared/lib.lua',
}

server_scripts {
  '@ts-shared/server/server.js',
  'server/sv_*.lua',
}

client_scripts {
  '@ts-shared/client/client.js',
  '@dg-logs/client/cl_log.lua',
  'client/cl_*.lua',
  'client/components/cl_*.lua',
}

ui_page "html/index.html"

files {
  "html/index.html",
  "html/favicon.ico",
  'html/assets/*',
  '!html/assets/*.map',
}

server_script "@dg-logs/server/sv_log.lua"
dependency "dg-auth"
