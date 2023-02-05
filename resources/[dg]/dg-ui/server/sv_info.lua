-- action is 'add' | 'remove'
-- If add we 100% sure players has one so no need to doublecheck
-- If remove then check if there are still more of the item remaining
DGX.Inventory.onInventoryUpdate('player', function(identifier, action)
  local hasVPN = true
  if action == 'remove' then
    hasVPN = DGX.Inventory.doesInventoryHaveItems('player', identifier, 'vpn')
  end
  local plySource = DGCore.Functions.getPlyIdForCid(tonumber(identifier))
  TriggerClientEvent('dg-ui:SendAppEvent', plySource, 'character', {
    hasVPN = hasVPN,
  })
end, 'vpn')

DGX.Inventory.onInventoryUpdate('player', function(identifier, action)
  local hasPhone = true
  if action == 'remove' then
    hasPhone = DGX.Inventory.doesInventoryHaveItems('player', identifier, 'phone')
  end
  local plySource = DGCore.Functions.getPlyIdForCid(tonumber(identifier))
  TriggerClientEvent('dg-ui:SendAppEvent', plySource, 'character', {
    hasPhone = hasPhone,
  })
end, 'phone')

AddEventHandler('onResourceStop', function(res)
  if GetCurrentResourceName() ~= res then return end
  print([[

    -------------------------------------

    Restart server to properly restart UI.
    New players will not be able to join!
    
    --------------------------------------
  
  ]])
end)