cache = {
  entity = {},
  coords = {}
}

RegisterNetEvent('nutty-sounds:playSoundOnEntity', function(id, name, bank, netId)
	local entity = NetworkGetEntityFromNetworkId(netId)
	if not entity or not DoesEntityExist(entity) then
		return
	end
	if cache.entity[id] ~= nil then
		TriggerClientEvent('nutty-sounds:stopSoundOnEntity', -1, id)
	end
	TriggerClientEvent('nutty-sounds:playSoundOnEntity', -1, id, name, bank, netId)
	cache.entity[id] = entity
end)

RegisterNetEvent('nutty-sounds:stopSoundOnEntity', function(id)
	if cache.entity[id] ~= nil then
		TriggerClientEvent('nutty-sounds:stopSoundOnEntity', -1, id)
		cache.entity[id] = nil
	end
end)

DGX.Events.onNet("nutty-sounds:playSoundFromCoord", function(src, id, name, bank, x, y, z, range)
  if cache.coords[id] ~= nil then
    DGX.Events.emitNet('nutty-sounds:stopSoundFromCoord', -1, id)
  end
  DGX.Events.emitNet('nutty-sounds:playSoundFromCoord', -1, id, name, bank, x, y, z, range)
  cache.coords[id] = 1
end)

DGX.Events.onNet('nutty-sounds:stopSoundFromCoord', function(id)
  if cache.entity[id] ~= nil then
    DGX.Events.emitNet('nutty-sounds:stopSoundOnEntity', -1, id)
    cache.entity[id] = nil
  end
end)