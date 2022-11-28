fx_version "cerulean"
games { "gta5" }

description "DeGrens Lib"

shared_script {
  '@dg-core/import.lua',
  '@ts-shared/shared/lib.lua',
  'shared/sh_*.lua',
}

server_scripts {
  '@ts-shared/server/server.js',
  "@dg-logs/server/sv_log.lua",
  "server/sv_*.lua",
  "server/sv_*.js",
}

client_scripts {
  '@ts-shared/client/client.js',
  '@dg-logs/client/cl_log.lua',
  "@PolyZone/client.lua",
  "@PolyZone/BoxZone.lua",
  "@PolyZone/CircleZone.lua",
  "@PolyZone/ComboZone.lua",
  "@PolyZone/EntityZone.lua",
  "client/**/cl_*.lua", -- this loads cl_.lua files in all client folders (client root and subfolders)
  "client/cl_*.js",
  "client/**/*.ymap.xml",
}
dependency "dg-auth"
