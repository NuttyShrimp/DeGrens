fx_version "cerulean"
games { "gta5" }

description "DeGrens Polytarget"

client_scripts {
  '@ts-shared/shared/lib.lua',
  "@ts-shared/client/client.js",
  '@dg-logs/client/cl_log.lua',
  "@PolyZone/client.lua",
  "@PolyZone/BoxZone.lua",
  "@PolyZone/CircleZone.lua",
  "@PolyZone/ComboZone.lua",
  "@PolyZone/EntityZone.lua",
  "@dg-lib/shared/sh_util.lua",
  "client/cl_*.lua",
}

dependency "dg-auth"