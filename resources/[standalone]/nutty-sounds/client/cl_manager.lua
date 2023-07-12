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

stopSound = function(id)
  DGX.Events.emitNet('nutty-sounds:stopSound', id)
end
exports('stopSound', stopSound)

RegisterNetEvent('nutty-sounds:playSoundOnEntity', function(id, name, bank, netId)
  if not NetworkDoesEntityExistWithNetworkId(netId) then return end
  local entity = NetworkGetEntityFromNetworkId(netId)
  if not DoesEntityExist(entity) then return end

  -- If sound with id still exists then stop that sound before continuing
  if sounds[id] then
    clearSoundId(id)
  end

  sounds[id] = GetSoundId()
  PlaySoundFromEntity(sounds[id], name, entity, bank, 0, 1.0)

  -- Wait till sounds stops playing or id has been cleared to stop and clear sound from active ids
  while sounds[id] and not HasSoundFinished(sounds[id]) do
    Citizen.Wait(10)
  end
  if sounds[id] then
    ReleaseSoundId(sounds[id])
    sounds[id] = nil
  end
end)

RegisterNetEvent('nutty-sounds:playSoundFromCoord', function(id, name, bank, coords, range)
  -- If sound with id still exists then stop that sound before continuing
  if sounds[id] then
    clearSoundId(id)
  end

  sounds[id] = GetSoundId()
  PlaySoundFromCoord(sounds[id], name, coords.x, coords.y, coords.z, bank, 0, 1.0, 1.0)

  -- Wait till sounds stops playing or id has been cleared to stop and clear sound from active ids
  while sounds[id] and not HasSoundFinished(sounds[id]) do
    Citizen.Wait(10)
  end
  if sounds[id] then
    ReleaseSoundId(sounds[id])
    sounds[id] = nil
  end
end)

clearSoundId = function(id)
  StopSound(sounds[id])
  ReleaseSoundId(sounds[id])
  sounds[id] = nil
end

RegisterNetEvent('nutty-sounds:stopSound', function(id)
  if not sounds[id] then return end
  clearSoundId(id)
end)