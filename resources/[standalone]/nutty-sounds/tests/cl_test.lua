local soundId = -1
local box = -1
RegisterCommand('music', function()
	soundId = GetSoundId()
	DeleteEntity(box)
	box = CreateObjectNoOffset(`prop_boombox_01`, vector3(-218.15, -926.21, 29.62), 1, false, false)
	FreezeEntityPosition(box, true)
	-- PlaySoundFromEntity(soundId, 'phone_dial', box, 'DLC_NUTTY_SOUNDS', 1, 1.0)
	-- PlaySoundFromEntity(soundId, 'phone_ringtone', box, 'DLC_NUTTY_SOUNDS', 1, 5.0)
	Wait(100)
	exports["nutty-sounds"]:playSoundOnEntity("test_sound", 'phone_ringtone', 'DLC_NUTTY_SOUNDS', box)
end, false)

AddEventHandler('onResourceStop', function(res)
	if (res == GetCurrentResourceName()) then
		DeleteEntity(box)
		exports["nutty-sounds"]:stopSoundOnEntity('test_sound')
	end
end)