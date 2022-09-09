cache = {}

DGX.Events.onNet('nutty-sounds:playSoundOnEntity', function(src, id, name, bank, netId)
	local entity = NetworkGetEntityFromNetworkId(netId)
	if not entity or not DoesEntityExist(entity) then
		return
	end
	if cache[id] then
		DGX.Events.emitNet('nutty-sounds:stopSound', -1, id)
	end
	DGX.Events.emitNet('nutty-sounds:playSoundOnEntity', -1, id, name, bank, netId)
	cache[id] = true
end)

DGX.Events.onNet("nutty-sounds:playSoundFromCoord", function(src, id, name, bank, coords, range)
  if cache[id] then
    DGX.Events.emitNet('nutty-sounds:stopSound', -1, id)
  end
  DGX.Events.emitNet('nutty-sounds:playSoundFromCoord', -1, id, name, bank, coords, range)
  cache[id] = true
end)

DGX.Events.onNet('nutty-sounds:stopSound', function(src, id)
  if cache[id] then
    DGX.Events.emitNet('nutty-sounds:stopSound', -1, id)
    cache[id] = nil
  end
end)