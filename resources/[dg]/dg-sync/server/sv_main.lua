function SyncExecution(native, entity, ...)
  if not DoesEntityExist(entity) then return end
  local owner = NetworkGetEntityOwner(entity)
  TriggerClientEvent('sync:execute', owner, native, NetworkGetNetworkIdFromEntity(entity), ...)
end

exports('SyncExecution', SyncExecution)

RegisterServerEvent('sync:request', function(native, netId, ...)
  local entity = NetworkGetEntityFromNetworkId(netId)
  SyncExecution(native, entity, ...)
end)