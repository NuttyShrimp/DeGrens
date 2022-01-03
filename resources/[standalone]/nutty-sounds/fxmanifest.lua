fx_version 'cerulean'

game 'gta5'

files {
	'dlc_nutty/sounds.awc',
	'data/sounds.dat54.rel',
}

data_file 'AUDIO_WAVEPACK' 'dlc_nutty'
data_file 'AUDIO_SOUNDDATA' 'data/sounds.dat'

client_scripts {
	"client/cl_*.lua",
	'tests/cl_*.lua'
}

server_scripts {
	"server/sv_*.lua",
}

