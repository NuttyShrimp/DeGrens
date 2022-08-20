local idsPerPlayer = {} -- Key: src, Value: {netid: boolean}

RegisterServerEvent('propattach:server:registerId', function(netId, instanceId)
  if not idsPerPlayer[source] then idsPerPlayer[source] = {} end
  idsPerPlayer[source][netId] = true
  if instanceId ~= 0 then setNetIdInstance(netId, instanceId) end
end)

RegisterServerEvent('propattach:server:unregisterId', function(netId)
  idsPerPlayer[source][netId] = nil
end)

AddEventHandler('playerDropped', function()
  for netId, _ in pairs(idsPerPlayer[source]) do
    removeObject(netId)
  end
  idsPerPlayer[source] = {}
end)

AddEventHandler('onResourceStop', function(resourceName)
  if GetCurrentResourceName() ~= resourceName then return end
  for _, ids in pairs(idsPerPlayer) do
    for netId, _ in pairs(ids) do
      removeObject(netId)
    end
  end
end)

RegisterServerEvent('propattach:server:updateInstance', function(instanceId)
  for netId, _ in pairs(idsPerPlayer[source]) do
    setNetIdInstance(netId, instanceId)
  end
end)

setNetIdInstance = function(netId, instanceId)
  local entity = NetworkGetEntityFromNetworkId(netId)
  SetEntityRoutingBucket(entity, instanceId)
end

removeObject = function(netId)
  local entity = NetworkGetEntityFromNetworkId(netId)
  DeleteEntity(entity)
end
