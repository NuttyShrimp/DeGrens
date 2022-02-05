PlayerData = {}
local registeredFlags = {}

getContext = function(entity, eType)
	context = {
		entity = entity,
		type = eType,
		model = GetEntityModel(entity),
		flags = {}
	}

	if NetworkGetEntityIsNetworked(entity) then
		context.entity = NetworkGetNetworkIdFromEntity(entity)
	end

	-- Flags
	if eType == 1 then
		if IsPedAPlayer(context.entity) then
			cfxPly = Player(GetPlayerServerId(NetworkGetPlayerIndexFromPed(context.entity)))
			for flag, _ in pairs(registeredFlags) do
				if cfxPly.state[flag] then
					context.flags[flag] = cfxPly.state[flag]
				end
			end
		end
	end
	cfxEntity = Entity(context.entity)
	for flag, _ in pairs(registeredFlags) do
		if cfxEntity.state[flag] then
			context.flags[flag] = cfxEntity.state[flag]
		end
	end

	return context
end

addFlag = function(flag)
	registeredFlags[flag] = true
end

-- This event will always be called after someshit is updated to the playerdata
-- No need for using extra events
RegisterNetEvent('DGCore:Player:SetPlayerData', function(_data)
	PlayerData = _data
end)

RegisterNetEvent('onResourceStart', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    while not DGCore do Wait(0) end
    PlayerData = DGCore.Functions.GetPlayerData()
end)
