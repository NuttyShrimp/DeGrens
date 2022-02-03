sounds = {}

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
	sounds[id] = GetSoundId()
	PlaySoundFromEntity(sounds[id], name, entity, bank, 0, 1.0)
end)

RegisterNetEvent('nutty-sounds:stopSoundOnEntity', function(id)
	if sounds[id] then
		StopSound(sounds[id])
		ReleaseSoundId(sounds[id])
		sounds[id] = nil
	end
end)