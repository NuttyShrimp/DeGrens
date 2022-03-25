RegisterNetEvent('DGCore:Server:OnInventoryUpdate', function(src, removed, added)
	-- Set hasVPN
	local Player = DGCore.Functions.GetPlayer(src)
	TriggerClientEvent('dg-ui:SendAppEvent', src, 'character', {
		hasVPN = Player.Functions.GetItemByName('vpn') ~= nil,
	})
end)

RegisterNetEvent('DGCore:Server:OnJobUpdate', function(src, job)
	TriggerClientEvent('dg-ui:SendAppEvent', src, 'character', {
		job = job.name,
	})
end)