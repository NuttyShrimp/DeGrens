cache = {}

RegisterNetEvent('nutty-sounds:playSoundOnEntity', function(id, name, bank, netId)
	local entity = NetworkGetEntityFromNetworkId(netId)
	if not entity or not DoesEntityExist(entity) then
		return
	end
	if cache[id] ~= nil then
		TriggerClientEvent('nutty-sounds:stopSoundOnEntity', -1, id)
	end
	TriggerClientEvent('nutty-sounds:playSoundOnEntity', -1, id, name, bank, netId)
	cache[id] = entity
end)

RegisterNetEvent('nutty-sounds:stopSoundOnEntity', function(id)
	if cache[id] ~= nil then
		TriggerClientEvent('nutty-sounds:stopSoundOnEntity', -1, id)
		cache[id] = nil
	end
end)