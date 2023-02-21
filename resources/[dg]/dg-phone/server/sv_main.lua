RegisterNetEvent('dg-phone:load', function()
  local src = source
  local hasPhone = DGX.Inventory.doesPlayerHaveItems(src, 'phone')
  TriggerClientEvent('dg-phone:client:setState', src, 'hasPhone', hasPhone)
  if getPlayerCallId(src) then
    TriggerClientEvent('dg-phone:client:setState', src, 'inCall', true)
  end
end)

-- action is 'add' | 'remove'
-- If add we 100% sure players has one so no need to doublecheck
-- If remove then check if there are still more of the item remaining
DGX.Inventory.onInventoryUpdate('player', function(identifier, action)
  local hasPhone = true
  if action == 'remove' then
    hasPhone = DGX.Inventory.doesInventoryHaveItems('player', identifier, 'phone')
  end
  local plySource = DGCore.Functions.getPlyIdForCid(tonumber(identifier))
  TriggerClientEvent('dg-phone:client:setState', plySource, 'hasPhone', hasPhone)
end, 'phone')

-- Close phone and hang up call when ply dies
exports('brickPhone', function(plyId)
  TriggerClientEvent('dg-phone:client:togglePhone', plyId, false)
  local callId = getPlayerCallId(plyId)
  if callId then
    endCall(callId)
  end
end)