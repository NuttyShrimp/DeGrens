pingManager = {}

RegisterNetEvent('dg-phone:pinger:request', function(data)
	data.target = tonumber(data.target)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	local Target = DGCore.Functions.GetPlayer(tonumber(data.target))
	if (data.isAnon and not DGX.Inventory.doesPlayerHaveItems(src, 'vpn')) then
		-- TODO ban injection
		return
	end
	if Target then
		pingManager[#pingManager+1] = {
			source = src,
			target = data.target,
			coords = GetEntityCoords(GetPlayerPed(src), true)
		}
		TriggerClientEvent('dg-phone:pinger:sendRequest', data.target, #pingManager, data.isAnon and "Anonymous Number" or Player.PlayerData.charinfo.phone);
	end
end)

RegisterNetEvent('dg-phone:pinger:accept', function(data)
	if pingManager[data.id] then
		info = pingManager[data.id]
		TriggerClientEvent('dg-phone:pinger:setPingLocation', info.target, info.coords, data.id);
	end
end)

RegisterNetEvent('dg-phone:pinger:decline', function(data)
	if pingManager[data.id] then
		pingManager[data.id] = nil
	end
end)