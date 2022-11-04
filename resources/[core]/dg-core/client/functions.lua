DGCore.Functions = {}
DGCore.RequestId = 0 -- IDX of promises
DGCore.NotiId = 1 -- Ids of persistent notifications
DGCore.Promises = {} -- Promises

-- Player

function DGCore.Functions.GetPlayerData(cb)
	if cb then
		cb(DGCore.PlayerData)
	else
		return DGCore.PlayerData
	end
end

-- Utility

function DGCore.Functions.DrawText3D(x, y, z, text)
    -- Use local function instead
    SetTextScale(0.35, 0.35)
    SetTextFont(4)
    SetTextProportional(1)
    SetTextColour(255, 255, 255, 215)
    SetTextEntry('STRING')
    SetTextCentre(true)
    AddTextComponentString(text)
    SetDrawOrigin(x, y, z, 0)
    DrawText(0.0, 0.0)
    local factor = (string.len(text)) / 370
    DrawRect(0.0, 0.0 + 0.0125, 0.017 + factor, 0.03, 0, 0, 0, 75)
    ClearDrawOrigin()
end

function DGCore.Functions.TriggerCallback(name, cb, ...)
	if (cb == nil or not DGCore.Shared.isFunction(cb)) then
		-- Promised based return
		local callId, solved = DGCore.RequestId, false
		DGCore.RequestId = DGCore.RequestId + 1

		DGCore.Promises[callId] = promise:new()

		if cb then
			TriggerServerEvent('DGCore:server:TriggerPromiseCallback', name, callId, cb, ...)
		else
			TriggerServerEvent('DGCore:server:TriggerPromiseCallback', name, callId, ...)
		end
		-- Check if solved otherwise throw timeout
		Citizen.SetTimeout(20000, function()
			if not solved then
				DGCore.Promises[callId]:resolve(nil)
			end
		end)

		local response = Citizen.Await(DGCore.Promises[callId])
		solved = true

		-- Remove with timeout so data is not lost
		Citizen.SetTimeout(5000, function()
			DGCore.Promises[callId] = nil
		end)

		return response
	else
		DGCore.ServerCallbacks[name] = cb
		TriggerServerEvent('DGCore:Server:TriggerCallback', name, ...)
	end
end

-- Getters

function DGCore.Functions.GetPlayers()
    return GetActivePlayers()
end

function DGCore.Functions.GetPeds(ignoreList)
    local pedPool = GetGamePool('CPed')
    local ignoreList = ignoreList or {}
    local peds = {}
    for i = 1, #pedPool, 1 do
        local found = false
        for j = 1, #ignoreList, 1 do
            if ignoreList[j] == pedPool[i] then
                found = true
            end
        end
        if not found then
            peds[#peds + 1] = pedPool[i]
        end
    end
    return peds
end

function DGCore.Functions.GetClosestPed(coords, ignoreList)
    local ped = PlayerPedId()
    if coords then
        coords = type(coords) == 'table' and vec3(coords.x, coords.y, coords.z) or coords
    else
        coords = GetEntityCoords(ped)
    end
    local ignoreList = ignoreList or {}
    local peds = DGCore.Functions.GetPeds(ignoreList)
    local closestDistance = -1
    local closestPed = -1
    for i = 1, #peds, 1 do
        local pedCoords = GetEntityCoords(peds[i])
        local distance = #(pedCoords - coords)

        if closestDistance == -1 or closestDistance > distance then
            closestPed = peds[i]
            closestDistance = distance
        end
    end
    return closestPed, closestDistance
end

function DGCore.Functions.GetClosestPlayer(coords)
    local ped = PlayerPedId()
    if coords then
        coords = type(coords) == 'table' and vec3(coords.x, coords.y, coords.z) or coords
    else
        coords = GetEntityCoords(ped)
    end
    local closestPlayers = DGCore.Functions.GetPlayersFromCoords(coords)
    local closestDistance = -1
    local closestPlayer = -1
    for i = 1, #closestPlayers, 1 do
        if closestPlayers[i] ~= PlayerId() and closestPlayers[i] ~= -1 then
            local pos = GetEntityCoords(GetPlayerPed(closestPlayers[i]))
            local distance = #(pos - coords)

            if closestDistance == -1 or closestDistance > distance then
                closestPlayer = closestPlayers[i]
                closestDistance = distance
            end
        end
    end
    return closestPlayer, closestDistance
end

function DGCore.Functions.GetPlayersFromCoords(coords, distance, serverIds)
    local players = DGCore.Functions.GetPlayers()
    local ped = PlayerPedId()
    if coords then
        coords = type(coords) == 'table' and vec3(coords.x, coords.y, coords.z) or coords
    else
        coords = GetEntityCoords(ped)
    end
    local distance = distance or 5
    local closePlayers = {}
    for _, player in pairs(players) do
        local target = GetPlayerPed(player)
        local targetCoords = GetEntityCoords(target)
        local targetdistance = #(targetCoords - coords)
        if targetdistance <= distance then
            closePlayers[#closePlayers + 1] = serverIds and GetPlayerServerId(player) or player
        end
    end
    return closePlayers
end

function DGCore.Functions.GetClosestVehicle(coords)
  if coords then
    coords = type(coords) == 'table' and vec3(coords.x, coords.y, coords.z) or coords
  else
    coords = GetEntityCoords(PlayerPedId())
  end

  local vehicles = GetGamePool('CVehicle')
  local closestDistance = 99999999
  local closestVehicle = nil

  for _, vehicle in pairs(vehicles) do
    local distance = #(GetEntityCoords(vehicle) - coords)
    if closestDistance > distance then
      closestVehicle = vehicle
      closestDistance = distance
    end
  end

  return closestVehicle, closestDistance
end

function DGCore.Functions.GetClosestObject(coords)
    local ped = PlayerPedId()
    local objects = GetGamePool('CObject')
    local closestDistance = -1
    local closestObject = -1
    if coords then
        coords = type(coords) == 'table' and vec3(coords.x, coords.y, coords.z) or coords
    else
        coords = GetEntityCoords(ped)
    end
    for i = 1, #objects, 1 do
        local objectCoords = GetEntityCoords(objects[i])
        local distance = #(objectCoords - coords)
        if closestDistance == -1 or closestDistance > distance then
            closestObject = objects[i]
            closestDistance = distance
        end
    end
    return closestObject, closestDistance
end

-- Vehicle

local function Round(value, numDecimalPlaces)
    if numDecimalPlaces then
        local power = 10 ^ numDecimalPlaces
        return math.floor((value * power) + 0.5) / (power)
    else
        return math.floor(value + 0.5)
    end
end

local function Trim(value)
    if value then
        return (string.gsub(value, '^%s*(.-)%s*$', '%1'))
    else
        return nil
    end
end

function DGCore.Functions.SpawnVehicle(model, cb, coords, isnetworked)
    local model = GetHashKey(model)
    local ped = PlayerPedId()
    if coords then
        coords = type(coords) == 'table' and vec3(coords.x, coords.y, coords.z) or coords
    else
        coords = GetEntityCoords(ped)
    end
    local isnetworked = isnetworked or true
    if not IsModelInCdimage(model) then
        return
    end
    RequestModel(model)
    while not HasModelLoaded(model) do
        Citizen.Wait(10)
    end
    local veh = CreateVehicle(model, coords.x, coords.y, coords.z, coords.w, isnetworked, false)
    local netid = NetworkGetNetworkIdFromEntity(veh)
    SetVehicleHasBeenOwnedByPlayer(veh, true)
    SetNetworkIdCanMigrate(netid, true)
    SetVehicleNeedsToBeHotwired(veh, false)
    SetVehRadioStation(veh, 'OFF')
    SetModelAsNoLongerNeeded(model)
    if cb then
        cb(veh)
    end
end
