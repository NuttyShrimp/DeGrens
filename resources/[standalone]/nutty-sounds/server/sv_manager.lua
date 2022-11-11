cache = {}

playSoundOnEntity = function(id, name, bank, netId)
	local entity = NetworkGetEntityFromNetworkId(netId)
	if not entity or not DoesEntityExist(entity) then return end
	DGX.Events.emitNet('nutty-sounds:playSoundOnEntity', -1, id, name, bank, netId)
	cache[id] = true
end
exports('playSoundOnEntity', playSoundOnEntity)

DGX.Events.onNet('nutty-sounds:playSoundOnEntity', function(src, id, name, bank, netId)
  playSoundOnEntity(id, name, bank, netId)
end)

playSoundFromCoord = function(id, name, bank, coords, range)
  DGX.Events.emitNet('nutty-sounds:playSoundFromCoord', -1, id, name, bank, coords, range)
  cache[id] = true
end
exports('playSoundFromCoord', playSoundFromCoord)

DGX.Events.onNet("nutty-sounds:playSoundFromCoord", function(src, id, name, bank, coords, range)
  playSoundFromCoord(id, name, bank, coords, range)
end)

stopSound = function(id)
  if not cache[id] then return end
  DGX.Events.emitNet('nutty-sounds:stopSound', -1, id)
  cache[id] = false
end
exports('stopSound', stopSound)

DGX.Events.onNet('nutty-sounds:stopSound', function(src, id)
  stopSound(id)
end)