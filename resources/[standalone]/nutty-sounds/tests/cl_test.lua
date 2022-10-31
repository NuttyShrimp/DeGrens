-- local soundId = -1
-- local box = -1

-- RegisterCommand('music', function()
-- 	DeleteEntity(box)
-- 	box = CreateObjectNoOffset(`prop_boombox_01`, vector3(-218.15, -926.21, 29.62), 1, false, false)
-- 	FreezeEntityPosition(box, true)
-- 	Wait(100)
--   DGX.Sounds.playOnEntity('test_sound', 'phone_ringtone', 'DLC_NUTTY_SOUNDS', box)
-- end, false)

-- AddEventHandler('onResourceStop', function(res)
-- 	if (res == GetCurrentResourceName()) then
-- 		DeleteEntity(box)
--     DGX.Sounds.stop('test_sound')
-- 	end
-- end)
