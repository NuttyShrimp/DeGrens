local isRevivedProm = nil

RegisterNetEvent('dg-phone:load', function()
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	PlyData = {
		server_id = tonumber(src),
		cid = Player.PlayerData.citizenid,
		firstname = Player.PlayerData.charinfo.firstname,
		lastname =  Player.PlayerData.charinfo.lastname,
		phone = Player.PlayerData.charinfo.phone,
		permissionGroup = DGCore.Functions.GetPermission(src),
		hasVPN = Player.Functions.GetItemByName('vpn') ~= nil,
	}
	TriggerClientEvent('dg-phone:client:setCharacterData', src, PlyData)
	TriggerClientEvent('dg-phone:client:setState', src, 'hasPhone', Player.Functions.GetItemByName('phone') ~= nil)
end)

RegisterNetEvent('DGCore:Server:OnInventoryUpdate', function(src, removed, added)
	-- Set hasVPN
	local Player = DGCore.Functions.GetPlayer(src)
	TriggerClientEvent('dg-phone:client:setCharacterData', src, {
		hasVPN = Player.Functions.GetItemByName('vpn') ~= nil,
	})
	TriggerClientEvent('dg-phone:client:setState', src, 'hasPhone', Player.Functions.GetItemByName('phone') ~= nil)
end)

brickPhone = function(src, event, toggle)
	if toggle then
		if event == "death" then
			if isRevivedProm then
				isRevivedProm:reject()
			end
		end
		TriggerClientEvent('dg-phone:client:togglePhone', src, false)
		-- Disable phone opening
		TriggerClientEvent('dg-phone:client:setState', src, 'isDead', true)
		-- Cancel current phone calls
		local callId = getPlayerCallId(src)
		if callId then
			endCall(callId)
		end
		return
	end
	if event == 'laststand' then
		isRevivedProm = promise.new()
		isRevivedProm:next(function()
			TriggerClientEvent('dg-phone:client:setState', src, 'isDead', false)
		end)
		SetTimeout(1000,function()
			isRevivedProm:resolve()
		end)
	else
		TriggerClientEvent('dg-phone:client:setState', src, 'isDead', false)
	end
end

RegisterNetEvent('hospital:server:SetLaststandStatus', function(state)
	brickPhone(source, 'laststand', state)
end)

RegisterNetEvent('hospital:server:SetDeathStatus', function(state)
	brickPhone(source, 'death', state)
end)