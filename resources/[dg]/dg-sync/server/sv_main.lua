RegisterServerEvent('sync:request')
AddEventHandler('sync:request', function(native, owner, netId, ...)
	local entity = NetworkGetEntityFromNetworkId(netId)
	TriggerClientEvent('sync:execute', owner, NetworkGetNetworkIdFromEntity(entity), ...)
end)