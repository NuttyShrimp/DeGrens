sounds = {
  entity = {},
  coords = {},
}

playSoundOnEntity = function(id, name, audiobank, entity)
	if not DoesEntityExist(entity) then
		Citizen.Trace(('[Nutty-Sounds] Entity does not exist! | id: %s | name: %s | audiobank: %s'):format(id, name, audiobank))
		return
	end
	local netId = NetworkGetNetworkIdFromEntity(entity)
	TriggerServerEvent('nutty-sounds:playSoundOnEntity', id, name, audiobank, netId)
end
exports('playSoundOnEntity', playSoundOnEntity)

stopSoundOnEntity = function(id)
	TriggerServerEvent('nutty-sounds:stopSoundOnEntity', id)
end
exports('stopSoundOnEntity', stopSoundOnEntity)

RegisterNetEvent('nutty-sounds:playSoundOnEntity', function(id, name, bank, netId)
  local entity = NetworkGetEntityFromNetworkId(netId)
  if not DoesEntityExist(entity) then return end
  sounds.entity[id] = GetSoundId()
  PlaySoundFromEntity(sounds.entity[id], name, entity, bank, 0, 1.0)
  while (not HasSoundFinished(sounds.entity[id]) and sounds.entity[id]) do
    ReleaseSoundId(sounds.entity[id])
    sounds.entity[id] = nil
    Citizen.Wait(10)
  end
end)

RegisterNetEvent('nutty-sounds:stopSoundOnEntity', function(id)
  if sounds.entity[id] then
    StopSound(sounds.entity[id])
    ReleaseSoundId(sounds.entity[id])
    sounds.entity[id] = nil
  end
end)

playSoundFromCoord = function(id, name, audiobank, x, y, z, range)
  DGX.Events.emitNet('nutty-sounds:playSoundFromCoord', id, name, audiobank, x, y, z, range)
end
exports('playSoundFromCoord', playSoundFromCoord)

stopSoundFromCoord = function(id)
  DGX.Events.emitNet('nutty-sounds:stopSoundFromCoord', id)
end
exports('stopSoundFromCoord', stopSoundFromCoord)

DGX.Events.onNet('nutty-sounds:playSoundFromCoord', function(id, name, bank, x, y, z, range)
  sounds.coords[id] = GetSoundId()
  PlaySoundFromCoords(sounds.coords[id], name, x, y, z, bank, 0, range, 1.0)
  while (not HasSoundFinished(sounds.coords[id]) and sounds.coords[id]) do
    ReleaseSoundId(sounds.coords[id])
    sounds.coords[id] = nil
    Citizen.Wait(10)
  end
end)

DGX.Events.onNet('nutty-sounds:stopSoundFromCoord', function(id)
  if sounds.coords[id] then
    StopSound(sounds.coords[id])
    ReleaseSoundId(sounds.coords[id])
    sounds.coords[id] = nil
  end
end)