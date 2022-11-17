-- action is 'add' | 'remove'
-- If add we 100% sure players has one so no need to doublecheck
-- If remove then check if there are still more of the item remaining
DGX.Inventory.onInventoryUpdate('player', function(identifier, action)
  local hasVPN = true
  if action == 'remove' then
    hasVPN = DGX.Inventory.doesInventoryHaveItems('player', identifier, 'vpn')
  end
  local plySource = DGCore.Functions.GetPlayerByCitizenId(tonumber(identifier)).PlayerData.source
  TriggerClientEvent('dg-ui:SendAppEvent', plySource, 'character', {
    hasVPN = hasVPN,
  })
end, 'vpn')

DGX.Inventory.onInventoryUpdate('player', function(identifier, action)
  local hasPhone = true
  if action == 'remove' then
    hasPhone = DGX.Inventory.doesInventoryHaveItems('player', identifier, 'phone')
  end
  local plySource = DGCore.Functions.GetPlayerByCitizenId(tonumber(identifier)).PlayerData.source
  TriggerClientEvent('dg-ui:SendAppEvent', plySource, 'character', {
    hasPhone = hasPhone,
  })
end, 'phone')

RegisterNetEvent('DGCore:Server:OnJobUpdate', function(src, job)
  TriggerClientEvent('dg-ui:SendAppEvent', src, 'character', {
    job = job.name,
  })
end)