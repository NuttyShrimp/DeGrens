AddEventHandler('inventory:playerInventoryUpdated', function(cid, action, state)
  if state.name ~= 'vpn' then return end
	local Player = DGCore.Functions.GetPlayerByCitizenId(cid)
  local hasVPN = DGX.Inventory.doesPlayerHaveItems(Player.PlayerData.source, 'vpn')
	TriggerClientEvent('dg-ui:SendAppEvent', Player.PlayerData.source, 'character', {
		hasVPN = hasVPN,
	})
end)

RegisterNetEvent('DGCore:Server:OnJobUpdate', function(src, job)
	TriggerClientEvent('dg-ui:SendAppEvent', src, 'character', {
		job = job.name,
	})
end)