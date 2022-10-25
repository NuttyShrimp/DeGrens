RegisterNetEvent("sync:execute")
AddEventHandler('sync:execute', function(native, netId, ...)
	local entity = NetworkGetEntityFromNetworkId(netId)

	if (syncActions[native]) then
		syncActions[native](entity,...)
	end
end)

function SyncExecution(native, entity, ...)
	if NetworkHasControlOfEntity(entity) then
		syncActions[native](entity, ...)
	else
		requestSyncedAction(native, entity, ...)
	end
end

exports('SyncExecution', SyncExecution)