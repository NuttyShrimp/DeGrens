function SyncExecution(native, entity, ...)
  if not syncActions[native] then return end
  if not DoesEntityExist(entity) then return end

	if NetworkHasControlOfEntity(entity) then
		syncActions[native](entity, ...)
	else
		TriggerServerEvent('sync:request', native, NetworkGetNetworkIdFromEntity(entity), ...)
	end
end

exports('SyncExecution', SyncExecution)

RegisterNetEvent("sync:execute", function(native, netId, ...)
	local entity = NetworkGetEntityFromNetworkId(netId)
  SyncExecution(native, entity, ...)
end)