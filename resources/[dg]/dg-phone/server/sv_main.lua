local isRevivedProm = nil

RegisterNetEvent('dg-phone:load', function()
	local src = source
  local hasPhone = DGX.Inventory.doesPlayerHaveItems(src, 'phone')
	TriggerClientEvent('dg-phone:client:setState', src, 'hasPhone', hasPhone)
end)

DGX.Inventory.onInventoryUpdate('player', function(identifier, action)
	local Player = DGCore.Functions.GetPlayerByCitizenId(tonumber(identifier))
  local hasPhone = DGX.Inventory.doesPlayerHaveItems(Player.PlayerData.source, 'phone')
	TriggerClientEvent('dg-phone:client:setState', Player.PlayerData.source, 'hasPhone', hasPhone)
end, 'phone')

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