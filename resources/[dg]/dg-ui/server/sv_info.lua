DGX.Inventory.onInventoryUpdate('player', function(identifier, action)
	local Player = DGCore.Functions.GetPlayerByCitizenId(tonumber(identifier))
  local hasVPN = DGX.Inventory.doesPlayerHaveItems(Player.PlayerData.source, 'vpn')
	TriggerClientEvent('dg-ui:SendAppEvent', Player.PlayerData.source, 'character', {
		hasVPN = hasVPN,
	})
end, 'vpn')

RegisterNetEvent('DGCore:Server:OnJobUpdate', function(src, job)
	TriggerClientEvent('dg-ui:SendAppEvent', src, 'character', {
		job = job.name,
	})
end)