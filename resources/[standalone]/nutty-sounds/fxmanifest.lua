fx_version 'cerulean'

game 'gta5'

files {
  'dlc_nutty/sounds.awc',
  'dlc_nutty/sirens.awc',
  'data/sounds.dat54.rel',
  'data/sirens.dat54.rel',
}

data_file 'AUDIO_WAVEPACK' 'dlc_nutty'
data_file 'AUDIO_SOUNDDATA' 'data/sounds.dat'
data_file 'AUDIO_SOUNDDATA' 'data/sirens.dat'

shared_script "@ts-shared/shared/lib.lua"
client_script "@ts-shared/client/client.js"
server_script "@ts-shared/server/server.js"

client_scripts {
  "client/cl_*.lua",
  -- 'tests/cl_*.lua'
}

server_scripts {
  "server/sv_*.lua",
  'tests/sv_*.lua'
}