RegisterUICallback('phone/pinger/request', function(data, cb)
	TriggerServerEvent('dg-phone:pinger:request', data)
	cb({data = {}, meta={ok = true, message = 'done'}})
end)

RegisterUICallback('phone/pinger/accept', function(data, cb)
	TriggerServerEvent('dg-phone:pinger:accept', data)
	cb({data = {}, meta={ok = true, message = 'done'}})
end)
RegisterUICallback('phone/pinger/decline', function(data, cb)
	TriggerServerEvent('dg-phone:pinger:decline', data)
	cb({data = {}, meta={ok = true, message = 'done'}})
end)

RegisterNetEvent('dg-phone:pinger:sendRequest', function(pingId, origin)
  PlaySound(-1, "Click_Fail", "WEB_NAVIGATION_SOUNDS_PHONE", 0, 0, 1)

  SendAppEvent('phone', {
    appName = "pinger",
		action = "doRequest",
		data = {
			id = pingId,
			origin = origin
		}
	})
end)

blips = {}

RegisterNetEvent('dg-phone:pinger:setPingLocation',  function(coords, id)
	blips[id] = AddBlipForCoord(coords)
	SetBlipSprite(blips[id], 280)
	SetBlipColour(blips[id], 4)
	SetBlipScale  (blips[id], 0.8)
	SetBlipAsShortRange(blips[id], true)
	BeginTextCommandSetBlipName("STRING")
	AddTextComponentString("Pinged location")
	EndTextCommandSetBlipName(blips[id])
	SetTimeout(20000, function()
		if blips[id] then
			RemoveBlip(blips[id])
			blips[id] = nil
		end
	end)
end)