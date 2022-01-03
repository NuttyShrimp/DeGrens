local soundInfo = {
	dial = {
		name = "phone_dial",
		ids = {}
	},
	ring = {
		name = "phone_ringtone",
		ids = {}
	},
}

playSound = function(type, id)
	exports["nutty-sounds"]:playSoundOnEntity(('phone_call_%s_%s'):format(type, id), soundInfo[type].name, 'DLC_NUTTY_SOUNDS', PlayerPedId())
	soundInfo[type].ids[id] = true
end

stopSounds = function(id)
	for k, v in pairs(soundInfo) do
		if v.ids[id] then
			exports["nutty-sounds"]:stopSoundOnEntity(('phone_call_%s_%s'):format(k, id))
			v.ids[id] = nil
		end
	end
end

RegisterNUICallback('phone:startCall', function(data, cb)
	local soundId = DGCore.Functions.TriggerCallback('dg-phone:server:startCall', nil, data)
	if soundId then
		playSound('dial', soundId)
	end
	cb({ data = {}, meta = { ok = true, message = "done" } })
end)

RegisterNUICallback('phone:dispatchEndCall', function(data, cb)
	DGCore.Functions.TriggerCallback('dg-phone:server:endCall', nil, data)
	cb({ data = {}, meta = { ok = true, message = "done" } })
end)

RegisterNUICallback('phone:acceptCall', function(data, cb)
	DGCore.Functions.TriggerCallback('dg-phone:server:initiateCall', nil, data)
	cb({ data = {}, meta = { ok = true, message = "done" } })
end)

RegisterNUICallback('phone:declineCall', function(data, cb)
	DGCore.Functions.TriggerCallback('dg-phone:server:endCall', nil, data)
	cb({ data = {}, meta = { ok = true, message = "done" } })
end)

RegisterNUICallback('phone:endcall', function(data, cb)
	cb({ data = {}, meta = { ok = true, message = "done" } })
end)

RegisterNetEvent('dg-phone:client:incomingCall')
AddEventHandler('dg-phone:client:incomingCall', function(data)
	playSound('ring', data.soundId)
	SendNUIMessage({
		app = "dialer",
		action = 'incomingCall',
		data = data
	})
end)

RegisterNetEvent('dg-phone:client:endCurrentCall', function(soundId)
	stopSounds(soundId)
	SendNUIMessage({
		app = "dialer",
		action = 'endCurrentCall',
		data = {}
	})
end)

RegisterNetEvent('dg-phone:client:initiateCall', function(soundId)
	stopSounds(soundId)
	SendNUIMessage({
		app = "dialer",
		action = "setCallActive",
		data = {}
	})
end)

-- Anon calls
Citizen.CreateThread(function()
	exports['dg-peek']:AddTargetModel({
		'p_phonebox_02_s',
		'prop_phonebox_03',
		'prop_phonebox_02',
		'prop_phonebox_04',
		'prop_phonebox_01c',
		'prop_phonebox_01a',
		'prop_phonebox_01b',
		'p_phonebox_01b_s',
	}, {
		options = {
			{
				icon = 'fas fa-phone',
				label = 'Use Payphone',
				item = 'phone',
				action = function(entity)
					local dialog = exports['qb-input']:ShowInput({
						header = "Make a call",
						submitText = "",
						inputs = {
							{
								text = "Phone Number",
								name = "phoneNumber",
								type = "number",
								isRequired = true
							},
						},
					})

					if dialog ~= nil then
						if (dialog.phoneNumber) then
							SendNUIMessage({
								app = "dialer",
								action = 'startAnonCall',
								data = dialog.phoneNumber
							})
						end
					end
				end,
				canInteract = function(entity, distance, data)
					return not exports["qb-prison"]:isInJail()
				end,
			}
		},
		distance = 1.5,
	})
end)
