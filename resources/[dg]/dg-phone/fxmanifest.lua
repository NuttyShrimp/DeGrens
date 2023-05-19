fx_version 'cerulean'
game 'gta5'

client_scripts {
  '@dg-lib/client/cl_ui.lua',
  "@dg-logs/client/cl_log.lua",
  "client/*.js",
}

server_script {
  "@dg-logs/server/sv_log.lua",
  "server/*.js",
}

dependency "dg-auth"