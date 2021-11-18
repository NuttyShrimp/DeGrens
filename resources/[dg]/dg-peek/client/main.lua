local PlayerData
local Players, Entities, Models, Zones, PedFlags =  {}, {}, {}, {}, {}
local playerPed, currentFlag, targetActive, hasFocus, success, AllowTarget, sendData = PlayerPedId(), 30, false, false, false, true, nil

AddEventHandler("onResourceStart", function(resourceName)
    if resourceName ~= GetCurrentResourceName() then return end
    PlayerData = QBCore.Functions.GetPlayerData()
end)

RegisterNetEvent("QBCore:Client:OnPlayerLoaded")
AddEventHandler("QBCore:Client:OnPlayerLoaded", function()
    PlayerData = QBCore.Functions.GetPlayerData()
end)

RegisterNetEvent("QBCore:Client:OnPlayerUnload")
AddEventHandler("QBCore:Client:OnPlayerUnload", function()
    PlayerData = {}
end)

RegisterNetEvent("QBCore:Client:OnJobUpdate")
AddEventHandler("QBCore:Client:OnJobUpdate", function(JobInfo)
    PlayerData.job = JobInfo
end)

RegisterNetEvent("QBCore:Client:OnGangUpdate")
AddEventHandler("QBCore:Client:OnGangUpdate", function(GangInfo)
    PlayerData.gang = GangInfo
end)

RegisterNetEvent("QBCore:Client:SetPlayerData")
AddEventHandler("QBCore:Client:SetPlayerData", function(data)
    PlayerData = data
end)

-- Startup thread
CreateThread(function()
    -- register function to keybind
    RegisterCommand("+playerPeek", EnableTarget, false)
    RegisterCommand("-playerPeek", DisableTarget, false)
    RegisterKeyMapping("+playerPeek", "Enable peeking~", "keyboard", Config.OpenKey)
    TriggerEvent("chat:removeSuggestion", "/+playerPeek")
    TriggerEvent("chat:removeSuggestion", "/-playerPeek")

    if next(Config.CircleZones) then
        for _, v in pairs(Config.CircleZones) do
            AddCircleZone(v.name, v.coords, v.radius, {
                name = v.name,
                debugPoly = v.debugPoly,
            }, {
                options = v.options,
                distance = v.distance
            })
        end
    end

    if next(Config.BoxZones) then
        for _, v in pairs(Config.BoxZones) do
            AddBoxZone(v.name, v.coords, v.length, v.width, {
                name = v.name,
                heading = v.heading,
                debugPoly = v.debugPoly,
                minZ = v.minZ,
                maxZ = v.maxZ
            }, {
                options = v.options,
                distance = v.distance
            })
        end
    end

    if next(Config.TargetModels) then
        for _, v in pairs(Config.TargetModels) do
            AddTargetModel(v.models, {
                options = v.options,
                distance = v.distance
            })
        end
    end

    if next(Config.PedFlags) then
        for _, v in pairs(Config.PedFlags) do
            AddPedFlag(v.flags, {
                options = v.options,
                distance = v.distance
            })
        end
    end

    if next(Config.GlobalPedOptions) then AddGlobalPed(Config.GlobalPedOptions) end
    if next(Config.GlobalVehicleOptions) then AddGlobalVehicle(Config.GlobalVehicleOptions) end
    if next(Config.GlobalObjectOptions) then AddGlobalObject(Config.GlobalObjectOptions) end
    if next(Config.GlobalPlayerOptions) then AddGlobalPlayer(Config.GlobalPlayerOptions) end
end)

-- Pressed the target key
function EnableTarget()
	if not AllowTarget or success then return end
	if not targetActive then
		SendNUIMessage({response = "openTarget"})

		CreateThread(function()
			while targetActive do            
                SetPauseMenuActive(false)
				if hasFocus then
					DisableControlAction(0, 1, true)
					DisableControlAction(0, 2, true)
				end
				DisablePlayerFiring(PlayerId(), true)
				DisableControlAction(0, 24, true)
				DisableControlAction(0, 25, true)
				DisableControlAction(0, 37, true)
				DisableControlAction(0, 47, true)
				DisableControlAction(0, 58, true)
				DisableControlAction(0, 140, true)
				DisableControlAction(0, 141, true)
				DisableControlAction(0, 142, true)
				DisableControlAction(0, 143, true)
				DisableControlAction(0, 257, true)
				DisableControlAction(0, 263, true)
				DisableControlAction(0, 264, true)
				Citizen.Wait(0)
			end
		end)

		playerPed = PlayerPedId()
        targetActive = true

        while targetActive do
			local playerCoords = GetEntityCoords(playerPed)
			local hit, coords, entity, entityType = RaycastCamera(SwitchFlag())

			if entityType > 0 then
				if NetworkGetEntityIsNetworked(entity) then
					local data = Entities[NetworkGetNetworkIdFromEntity(entity)]
					if data then
						CheckEntity(hit, data, entity, #(playerCoords - coords))
					end
				end

                if entityType == 1 then
                    if IsPedAPlayer(entity) then
                        local data = Players
                        if data then
                            CheckEntity(hit, data, entity, #(playerCoords - coords))
                        end
                    else
                        local data = PedFlags[Entity(entity).state.flagName]
                        if data and Entity(entity).state.flagState then
                            CheckEntity(hit, data, entity, #(playerCoords - coords))
                        end 
                    end
                elseif entityType >= 2 then
                    local data = Models[GetEntityModel(entity)]
                    if data then
                        CheckEntity(hit, data, entity, #(playerCoords - coords))
                    end
                end

				-- Generic targets
                -- success gets set to true in previous entitychecks so if none are in config then we check the global options
				if not success then
					local data = Types[entityType]
					if data then
						CheckEntity(hit, data, entity, #(playerCoords - coords))
					end
				end
			end

            -- if there were no entities selected we check if the coord is in a polyzone
			if not success then
				for _, zone in pairs(Zones) do
					local distance = #(playerCoords - zone.center)
					if zone:isPointInside(coords) and distance <= zone.targetoptions.distance then
						local send_options, slot = {}, 0

						for _, data in pairs(zone.targetoptions.options) do
							if CheckOptions(data, entity, distance) then
								slot = #send_options + 1
								send_options[slot] = data
								send_options[slot].entity = entity
							end
						end

						sendData = send_options
						if next(send_options) then
							success = true
							SendNUIMessage({response = "foundTarget", data = sendData[slot].targeticon})
							while targetActive and success do
								local playerCoords = GetEntityCoords(playerPed)
								local _, endcoords, entity2 = RaycastCamera(hit)

								if not zone:isPointInside(endcoords) then
                                    CheckIfReleasedButtonOrLeftTarget()
								elseif not hasFocus and (IsControlPressed(0, Config.MenuControlKey) or IsDisabledControlPressed(0, Config.MenuControlKey)) then
									EnableNUI(CloneTable(sendData))
								elseif #(playerCoords - zone.center) > zone.targetoptions.distance then
                                    CheckIfReleasedButtonOrLeftTarget()
								end

								Citizen.Wait(0)
							end

                            CheckIfReleasedButtonOrLeftTarget()
						end
					end
				end
			end
			Wait(100)
		end
		DisableTarget(false)
	end
end

function RaycastCamera(flag)
	local cameraCoords = GetGameplayCamCoord()
	local cameraRotation = GetGameplayCamRot()
    local direction = RotationToDirection(cameraRotation)
	local destination = vector3(cameraCoords.x + direction.x * 30, cameraCoords.y + direction.y * 30, cameraCoords.z + direction.z * 30)
	local rayHandle = StartShapeTestLosProbe(cameraCoords, destination, flag or -1, playerPed or PlayerPedId(), 0)
	while true do
		Wait(0)
		local result, _, endCoords, _, entityHit = GetShapeTestResult(rayHandle)
		if result ~= 1 then
			local entityType = 0
			if entityHit ~= 0 then entityType = GetEntityType(entityHit) end
			return flag, endCoords, entityHit, entityType
		end
	end
end

function RotationToDirection(rotation)
	local adjustedRotation =  {
		x = (math.pi / 180) * rotation.x,
		y = (math.pi / 180) * rotation.y,
		z = (math.pi / 180) * rotation.z
	}
	local direction = {
		x = -math.sin(adjustedRotation.z) * math.abs(math.cos(adjustedRotation.x)),
		y = math.cos(adjustedRotation.z) * math.abs(math.cos(adjustedRotation.x)),
		z = math.sin(adjustedRotation.x)
	}
	return direction
end

function CheckEntity(hit, datatable, entity, distance)
	local send_options, send_distance, slot = {}, {}, 0

	for _, data in pairs(datatable) do
		if CheckOptions(data, entity, distance) then
			slot = #send_options + 1
			send_options[slot] = data
			send_options[slot].entity = entity
			send_distance[data.distance] = true
		else send_distance[data.distance] = false end
	end

	sendData = send_options
	if next(send_options) then
		success = true
		SendNUIMessage({response = "foundTarget", data = sendData[slot].targeticon})

		while targetActive and success do
			local playerCoords = GetEntityCoords(playerPed)
			local _, coords, entity2 = RaycastCamera(hit)
			local dist = #(playerCoords - coords)

			if entity ~= entity2 then
                CheckIfReleasedButtonOrLeftTarget()
				break
			elseif not hasFocus and (IsControlPressed(0, Config.MenuControlKey) or IsDisabledControlPressed(0, Config.MenuControlKey)) then
				EnableNUI(CloneTable(sendData))
			else
				for k, v in pairs(send_distance) do
					if v and dist > k then
                        CheckIfReleasedButtonOrLeftTarget()
						break
					end
				end
			end

			Citizen.Wait(0)
		end

        CheckIfReleasedButtonOrLeftTarget()
	end
end

function CheckIfReleasedButtonOrLeftTarget()
    if IsControlReleased(0, Config.OpenControlKey) or IsDisabledControlReleased(0, Config.OpenControlKey) then
        DisableTarget(true)
    else
        LeftTarget()
    end
end

function CheckOptions(data, entity, distance)
    if (not data.distance or distance <= data.distance)
    and (not data.job or data.job == PlayerData.job.name or (data.job[PlayerData.job.name] and data.job[PlayerData.job.name] <= PlayerData.job.grade.level))
    and (not data.gang or data.gang == PlayerData.gang.name or (data.gang[PlayerData.gang.name] and data.gang[PlayerData.gang.name] <= PlayerData.gang.grade.level))
    and (not data.item or data.item and HasItem(data.item))
    and (not data.canInteract or data.canInteract(entity, distance, data)) then return true
    end
    return false
end

function HasItem(required)
    for _, item in pairs(PlayerData.items) do
        if v.name == required then
            return true
        end
    end
    return false
end

function CloneTable(table)
	local copy = {}
	for k, v in pairs(table) do
		if type(v) == "table" then
			copy[k] = CloneTable(v)
		else
			if type(v) == "function" then v = nil end
			copy[k] = v
		end
	end
	return copy
end

function SwitchFlag()
	if currentFlag == 30 then currentFlag = -1 else currentFlag = 30 end
	return currentFlag
end

function EnableNUI(options)
	if targetActive and not hasFocus then
		SetCursorLocation(0.5, 0.5)
		SetNuiFocus(true, true)
		SetNuiFocusKeepInput(true)
		hasFocus = true
		SendNUIMessage({response = "validTarget", data = options})
	end
end

function LeftTarget()
	SetNuiFocus(false, false)
	SetNuiFocusKeepInput(false)
	success, hasFocus = false, false
	SendNUIMessage({response = "leftTarget"})
end

function DisableTarget(forcedisable)
	if (targetActive and not hasFocus) or forcedisable then
		SetNuiFocus(false, false)
		SetNuiFocusKeepInput(false)
		Wait(100)
		targetActive, success, hasFocus = false, false, false
		SendNUIMessage({response = "closeTarget"})
	end
end





-- functions for adding types/zones data
function AddCircleZone(name, center, radius, options, targetoptions)
	center = type(center) == "table" and vector3(center.x, center.y, center.z) or center
	Zones[name] = CircleZone:Create(center, radius, options)
	targetoptions.distance = targetoptions.distance or Config.MaxDistance
	Zones[name].targetoptions = targetoptions
end

function AddBoxZone(name, center, length, width, options, targetoptions)
	center = type(center) == "table" and vector3(center.x, center.y, center.z) or center
	Zones[name] = BoxZone:Create(center, length, width, options)
	targetoptions.distance = targetoptions.distance or Config.MaxDistance
	Zones[name].targetoptions = targetoptions
end

function AddComboZone(zones, options, targetoptions)
	Zones[name] = ComboZone:Create(zones, options)
	targetoptions.distance = targetoptions.distance or Config.MaxDistance
	Zones[name].targetoptions = targetoptions
end

function AddTargetEntity(entities, parameters)
	local distance, options = parameters.distance or Config.MaxDistance, parameters.options
	if type(entities) == "table" then
		for _, entity in pairs(entities) do
			entity = NetworkGetEntityIsNetworked(entity) and NetworkGetNetworkIdFromEntity(entity) or false
			if entity then
				if not Entities[entity] then Entities[entity] = {} end
				for _, v in pairs(options) do
					if v.distance == nil or not v.distance or v.distance > distance then v.distance = distance end
					Entities[entity][v.label] = v
				end
			end
		end
	elseif type(entities) == "number" then
		local entity = NetworkGetEntityIsNetworked(entities) and NetworkGetNetworkIdFromEntity(entities) or false
		if entity then
			if not Entities[entity] then Entities[entity] = {} end
			for _, v in pairs(options) do
				if v.distance == nil or not v.distance or v.distance > distance then v.distance = distance end
				Entities[entity][v.label] = v
			end
		end
	end
end

function AddEntityZone(name, entity, options, targetoptions)
	Zones[name] = EntityZone:Create(entity, options)
	targetoptions.distance = targetoptions.distance or Config.MaxDistance
	Zones[name].targetoptions = targetoptions
end

function AddTargetModel(models, parameters)
	local distance, options = parameters.distance or Config.MaxDistance, parameters.options
	if type(models) == "table" then
		for _, model in pairs(models) do
			if type(model) == "string" then model = GetHashKey(model) end
			if not Models[model] then Models[model] = {} end
			for _, v in pairs(options) do
				if v.distance == nil or not v.distance or v.distance > distance then v.distance = distance end
				Models[model][v.label] = v
			end
		end
	else
		if type(models) == "string" then models = GetHashKey(models) end
		if not Models[models] then Models[models] = {} end
		for _, v in pairs(options) do
			if v.distance == nil or not v.distance or v.distance > distance then v.distance = distance end
			Models[models][v.label] = v
		end
	end
end

function AddPedFlag(flags, parameters)
	local distance, options = parameters.distance or Config.MaxDistance, parameters.options
	if type(flags) == "table" then
		for _, flag in pairs(flags) do
			if not PedFlags[flag] then PedFlags[flag] = {} end
			for _, v in pairs(options) do
				if v.distance == nil or not v.distance or v.distance > distance then v.distance = distance end
				Flags[flag][v.label] = v
			end
		end
	else
		if not PedFlags[flags] then PedFlags[flags] = {} end
		for _, v in pairs(options) do
			if v.distance == nil or not v.distance or v.distance > distance then v.distance = distance end
			PedFlags[flags][v.label] = v
		end
	end
end

function AddGlobalPed(parameters) AddGlobalType(1, parameters) end
function AddGlobalVehicle(parameters) AddGlobalType(2, parameters) end
function AddGlobalObject(parameters) AddGlobalType(3, parameters) end

function AddGlobalType(type, parameters)
	local distance, options = parameters.distance or Config.MaxDistance, parameters.options
	for _, v in pairs(options) do
		if v.distance == nil or not v.distance or v.distance > distance then v.distance = distance end
		Types[type][v.label] = v
	end
end

function AddGlobalPlayer(parameters)
	local distance, options = parameters.distance or Config.MaxDistance, parameters.options
	for _, v in pairs(options) do
		if v.distance == nil or not v.distance or v.distance > distance then v.distance = distance end
		Players[v.label] = v
	end
end





-- functions for removing type/zone data
function RemoveZone(name)
	if not Zones[name] then return end
	if Zones[name].destroy then
		Zones[name]:destroy()
	end
	Zones[name] = nil
end

function RemoveTargetModel(models, labels)
	if type(models) == "table" then
		for _, model in pairs(models) do
			if type(model) == "string" then model = GetHashKey(model) end
			if type(labels) == "table" then
				for _, v in pairs(labels) do
					if Models[model] then
						Models[model][v] = nil
					end
				end
			elseif type(labels) == "string" then
				if Models[model] then
					Models[model][labels] = nil
				end
			end
		end
	else
		if type(models) == "string" then models = GetHashKey(models) end
		if type(labels) == "table" then
			for _, v in pairs(labels) do
				if Models[models] then
					Models[models][v] = nil
				end
			end
		elseif type(labels) == "string" then
			if Models[models] then
				Models[models][labels] = nil
			end
		end
	end
end

function RemoveTargetEntity(entities, labels)
	if type(entities) == "table" then
		for _, entity in pairs(entities) do
			entity = NetworkGetEntityIsNetworked(entity) and NetworkGetNetworkIdFromEntity(entity) or false
			if entity then
				if type(labels) == "table" then
					for _, v in pairs(labels) do
						if Entities[entity] then
							Entities[entity][v] = nil
						end
					end
				elseif type(labels) == "string" then
					if Entities[entity] then
						Entities[entity][labels] = nil
					end
				end
			end
		end
	elseif type(entities) == "string" then
		local entity = NetworkGetEntityIsNetworked(entities) and NetworkGetNetworkIdFromEntity(entities) or false
		if entity then
			if type(labels) == "table" then
				for _, v in pairs(labels) do
					if Entities[entity] then
						Entities[entity][v] = nil
					end
				end
			elseif type(labels) == "string" then
				if Entities[entity] then
					Entities[entity][labels] = nil
				end
			end
		end
	end
end

function RemoveGlobalPed(labels) RemoveGlobalType(1, labels) end
function RemoveGlobalVehicle(labels) RemoveGlobalType(2, labels) end
function RemoveGlobalObject(labels) RemoveGlobalType(3, labels) end

function RemoveGlobalType(type, labels)
	if type(labels) == "table" then
		for _, v in pairs(labels) do
			Types[type][v] = nil
		end
	elseif type(labels) == "string" then
		Types[type][labels] = nil
	end
end

function RemoveGlobalPlayer(labels)
	if type(labels) == "table" then
		for _, v in pairs(labels) do
			Players[v] = nil
		end
	elseif type(labels) == "string" then
		Players[labels] = nil
	end
end





-- NUI Callbacks
RegisterNUICallback("selectTarget", function(option, cb)
    SetNuiFocus(false, false)
    SetNuiFocusKeepInput(false)
	Wait(100)
	targetActive, success, hasFocus = false, false, false
    local data = sendData[option]
    CreateThread(function()
        Wait(50)
        if data then
            if data.action then
                data.action(data.entity)
            elseif data.event then
                if data.type == "client" then
                    TriggerEvent(data.event, data)
                elseif data.type == "server" then
                    TriggerServerEvent(data.event, data)
                elseif data.type == "command" then
                    ExecuteCommand(data.event)
                elseif data.type == "qbcommand" then
                    TriggerServerEvent("QBCore:CallCommand", data.event, data)
                else
                    TriggerEvent(data.event, data)
                end
            else
                print("No trigger setup")
            end
        end
    end)

    sendData = nil
end)

RegisterNUICallback("closeTarget", function(data, cb)
	SetNuiFocus(false, false)
	SetNuiFocusKeepInput(false)
	Wait(100)
	targetActive, success, hasFocus = false, false, false
end)





-- exports for adding targettingdata for type/zone
exports("AddCircleZone", AddCircleZone)
exports("AddBoxZone", AddBoxZone)
exports("AddComboZone", AddComboZone)
exports("AddTargetEntity", AddTargetEntity)
exports("AddEntityZone", AddEntityZone)
exports("AddTargetModel", AddTargetModel)
exports("AddGlobalType", AddGlobalType)
exports("AddGlobalPed", AddGlobalPed)
exports("AddGlobalVehicle", AddGlobalVehicle)
exports("AddGlobalObject", AddGlobalObject)
exports("AddGlobalPlayer", AddGlobalPlayer)

-- exports for removing targettingdata for type/zone
exports("RemoveZone", RemoveZone)
exports("RemoveTargetModel", RemoveTargetModel)
exports("RemoveTargetEntity", RemoveTargetEntity)
exports("RemoveGlobalType", RemoveGlobalType)
exports("RemoveGlobalPed", RemoveGlobalPed)
exports("RemoveGlobalVehicle", RemoveGlobalVehicle)
exports("RemoveGlobalObject", RemoveGlobalObject)
exports("RemoveGlobalPlayer", RemoveGlobalPlayer)

-- exports for getting targettingdata for type/zone
exports("GetZoneData", function(name) return Zones[name] end)
exports("GetTargetEntityData", function(entity, label) return Entities[entity][label] end)
exports("GetTargetModelData", function(model, label) return Models[model][label] end)
exports("GetGlobalTypeData", function(type, label) return Types[type][label] end)
exports("GetGlobalPedData", function(label) return Types[1][label] end)
exports("GetGlobalVehicleData", function(label) return Types[2][label] end)
exports("GetGlobalObjectData", function(label) return Types[3][label] end)
exports("GetGlobalPlayerData", function(label) return Players[label] end)

-- exports for updating targettingdata for type/zone
exports("UpdateZoneData", function(name, data) Zones[name] = data end)
exports("UpdateTargetEntityData", function(entity, label, data) Entities[entity][label] = data end)
exports("UpdateTargetModelData", function(model, label, data) Models[model][label] = data end)
exports("UpdateGlobalTypeData", function(type, label, data) Types[type][label] = data end)
exports("UpdateGlobalPedData", function(label, data) Types[1][label] = data end)
exports("UpdateGlobalVehicleData", function(label, data) Types[2][label] = data end)
exports("UpdateGlobalObjectData", function(label, data) Types[3][label] = data end)
exports("UpdateGlobalPlayerData", function(label, data) Players[label] = data end)

-- exports for general stuff relating targetting
exports("AllowTargeting", function(bool) AllowTarget = bool end)
exports("IsTargetActive", function() return targetActive end)
exports("IsTargetSuccess", function() return success end)





RegisterNetEvent("dg-peek:Test", function(params)
    print(params.string)
end)