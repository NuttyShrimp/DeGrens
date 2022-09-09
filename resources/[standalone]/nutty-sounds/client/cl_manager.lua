sounds = {}

playSoundOnEntity = function(id, name, audiobank, entity)
	if not DoesEntityExist(entity) then
		Citizen.Trace(('[Nutty-Sounds] Entity does not exist! | id: %s | name: %s | audiobank: %s'):format(id, name, audiobank))
		return
	end
	local netId = NetworkGetNetworkIdFromEntity(entity)
	DGX.Events.emitNet('nutty-sounds:playSoundOnEntity', id, name, audiobank, netId)
end
exports('playSoundOnEntity', playSoundOnEntity)

playSoundFromCoord = function(id, name, audiobank, coords, range)
  DGX.Events.emitNet('nutty-sounds:playSoundFromCoord', id, name, audiobank, coords, range)
end
exports('playSoundFromCoord', playSoundFromCoord)

DGX.Events.onNet('nutty-sounds:playSoundOnEntity', function(id, name, bank, netId)
  local entity = NetworkGetEntityFromNetworkId(netId)
  if not DoesEntityExist(entity) then return end
  sounds[id] = GetSoundId()
  PlaySoundFromEntity(sounds[id], name, entity, bank, 0, 1.0)
  while sounds[id] and not HasSoundFinished(sounds[id]) do
    Citizen.Wait(10)
  end
  if sounds[id] then
    ReleaseSoundId(sounds[id])
    sounds[id] = nil
  end
end)

DGX.Events.onNet('nutty-sounds:playSoundFromCoord', function(id, name, bank, coords, range)
  sounds[id] = GetSoundId()
  PlaySoundFromCoord(sounds[id], name, coords.x, coords.y, coords.z, bank, 0, 1.0, 1.0)
  while sounds[id] and not HasSoundFinished(sounds[id]) do
    Citizen.Wait(10)
  end
  if sounds[id] then
    ReleaseSoundId(sounds[id])
    sounds[id] = nil
  end
end)

stopSound = function(id)
  DGX.Events.emitNet('nutty-sounds:stopSound', id)
end
exports('stopSound', stopSound)

DGX.Events.onNet('nutty-sounds:stopSound', function(id)
  if not sounds[id] then return end
  StopSound(sounds[id])
  ReleaseSoundId(sounds[id])
  sounds[id] = nil
end)