DGCore = exports['dg-core']:GetCoreObject()

local peekEntries = {
	model = {},
	entity = {},
	bones = {},
	flags = {},
	zones = {},
}
local activeEntries = {
	model = {},
	entity = {},
	bones = {},
	flags = {},
	zones = {},
}
local current = {
	entity = nil,
	type = nil,
	coords = nil,
}
local activeZones = {}
local canPeek, isPeeking, isFocused, generatedId = true, false, false, 1

--region Functions
setPeekEnabled = function(isEnabled)
	canPeek = isEnabled
end

enablePeek = function()
	if not canPeek or isPeeking then return end

	SendNUIMessage({ response = "openTarget" })
	isPeeking = true
	startCheckThread()
	startControlThread()
end

disablePeek = function()
	if isFocused then return end

	SendNUIMessage({ response = "closeTarget" })
	SetNuiFocusKeepInput(false)
	SetNuiFocus(false, false)

	isPeeking = false
	isFocused = false
	activeEntries = {
		model = {},
		entity = {},
		bones = {},
		flags = {},
		zones = {},
	}
end

focusUI = function()
	if isFocused then return end
	if not hasActiveEntries(activeEntries) then return end

	isFocused = true
	SetCursorLocation(0.5, 0.5)
	SetNuiFocus(true, true)
	SetNuiFocusKeepInput(true)
	SendNUIMessage({ response = "showOptions" })
end

-- Entry logic
--region Helpers
addNewEntry = function(cat, entry, distance)
    -- Job
    if entry.job then
        if type(entry.job) == 'string' then
            if not PlayerData.job.name == entry.job then
                return
            end
        end
        if type(entry.job) == 'table' then
            if entry.job[1] then
                if not isItemInArray(entry.job, PlayerData.job.name) then
                    return
                end
            else
                local reqGrade = getValueFromTable(entry.job, PlayerData.job.name)
                if not reqGrade or reqGrade > PlayerData.job.grade.level then
                    return
                end
            end
        end
    end
    -- Gang
    if entry.gang then
        if type(entry.gang) == 'string' then
            if not PlayerData.gang.name == entry.gang then
                return
            end
        end
        if type(entry.gang) == 'table' then
            if not isItemInArray(entry.gang, PlayerData.gang.name) then
                return
            end
        end
    end
    -- Items
    if entry.items then
        if type(entry.items) == 'string' then
            if not DGCore.Functions.HasItem(entry.items) then
                return
            end
        end
        if type(entry.items) == 'table' then
            local hasItem = true
            for _, item in ipairs(entry.items) do
                if not DGCore.Functions.HasItem(item) then
                    hasItem = false
                    break
                end
            end
            if not hasItem then
                return
            end
        end
    end
    -- Can Interact
    if entry.canInteract then
        if not entry.canInteract(current.entity, entry.distance, entry) then
            return
        end
    end
    -- Distance check
    if distance > entry.distance then
        return
    end
    -- If it complies with everything then add it
    table.insert(activeEntries[cat], entry)
    refreshList()
end

refreshList = function()
	-- Send refreshedList to UI
	if not hasActiveEntries(activeEntries) then
		SendNUIMessage({ response = "leftTarget" })
		return
	end
	local _list = {}
	for sub, entries in pairs(activeEntries) do
		for _, entry in ipairs(entries) do
			table.insert(_list, entry)
		end
	end
	SendNUIMessage({ response = "foundTarget", data = _list })
end
--endregion

--region Thread creators
startCheckThread = function()
	CreateThread(function()
		while isPeeking and not isFocused do
            generateCurrentEntries()
			Wait(100)
		end
	end)
end

startControlThread = function()
	while isPeeking do
		Wait(0)
		SetPauseMenuActive(false)
		DisablePlayerFiring(PlayerId(), true)
		for _, key in ipairs(DISABLED_KEYS) do
			DisableControlAction(0, key, true)
		end
		if isFocused then
			DisableControlAction(0, 1, true)
			DisableControlAction(0, 2, true)
		end
		if isFocused and IsControlJustPressed(0, Config.FocusKey) or IsDisabledControlJustPressed(0, Config.FocusKey) then
			focusUI()
		end
	end
end
--endregion

generateCurrentEntries = function()
	local ped = PlayerPedId()
	local plyCoords = GetEntityCoords(ped)

    activeEntries.model = {}
    activeEntries.entity = {}
    activeEntries.bones = {}
    activeEntries.flags = {}
    activeEntries.zones = {}

    -- entity stuff
	if current.entity then
		local context = getContext(current.entity, current.type)
		if peekEntries.model[context.model] then
			for _, entry in ipairs(peekEntries.model[context.model]) do
                addNewEntry('model', entry, #(plyCoords - current.coords))
			end
		end
		if NetworkGetNetworkIdFromEntity(current.entity) then
			local netId = NetworkGetNetworkIdFromEntity(current.entity)
			if peekEntries.entity[netId] then
				for _, entry in ipairs(peekEntries.entity[netId]) do
                    addNewEntry('model', entry, #(plyCoords - current.coords))
				end
			end
		end
		for flag, active in pairs(context.flags) do
			if peekEntries.flags[flag] and active then
				for _, entry in ipairs(peekEntries.flags[flag]) do
                    addNewEntry('model', entry, #(plyCoords - current.coords))
				end
			end
		end
		for bone, entries in pairs(peekEntries.bones) do
			local boneId = GetEntityBoneIndexByName(current.entity, bone)
			if boneId ~= -1 then
				local bonePos = GetWorldPositionOfEntityBone(current.entity, boneId)
                local intersectPos = exports["dg-lib"]:GetIntersectCoords()
                if #(bonePos - intersectPos) < Config.MaxBoneDistance then
                    for _, entry in ipairs(entries) do
                        addNewEntry('model', entry, #(plyCoords - bonePos))
                    end
                end
			end
		end
	end
    
    -- zone stuff
    for zoneName, zoneInfo in pairs(activeZones) do
        if zoneInfo.point and peekEntries.zones[zoneName] then
            for index, entry in ipairs(peekEntries.zones[zoneName]) do
                entry.data = entry.data and combineTables(entry.data, zoneInfo.data) or zoneInfo.data
                addNewEntry("zones", entry, #(plyCoords - zoneInfo.point))
            end
        end
    end
	refreshList()
end

--region Entries
--region Adders
addEntry = function(entryType, key, parameters, checker)
	if not peekEntries[entryType] then
		print(('[DG-Peek] Invalid entry type | type: %s | name: %s '):format(entryType, key))
		return
	end
	if type(key) == 'table' then
		local newIds = {}
		for _, v in pairs(key) do
			newIds = combineTables(newIds, addEntry(entryType, v, parameters))
		end
		return newIds
	end

	if type(key) ~= ENTRY_TYPES[entryType] then
		print(('[DG-Peek] Entry is invalid name | type: %s | name: %s '):format(entryType, key))
		return
	end

	if checker and not checker(key) then
		return
	end

	if not peekEntries[entryType][key] then
		peekEntries[entryType][key] = {}
	end

	local newIds = {}
	for _, option in pairs(parameters.options) do
		option.distance = option.distance or parameters.distance
		-- copy generatedId so its not a reference
		option.id = json.decode(json.encode(generatedId))
		table.insert(peekEntries[entryType][key], option)
		table.insert(newIds, option.id)
		generatedId = generatedId + 1
	end
	return newIds
end

addModelEntry = function(model, parameters)
	if type(model) == 'table' then
		local ids = {}
		for _, v in pairs(model) do
			ids = combineTables(addModelEntry(v, parameters), ids)
		end
		return ids
	end
	if type(model) == 'string' then
		model = GetHashKey(model)
	end
	return addEntry('model', model, parameters)
end

addEntityEntry = function(entity, parameters)
	return addEntry('entity', entity, parameters)
end

addBoneEntry = function(bone, parameters)
	local checker = function(bone)
		if (not isItemInArray(BONES, bone)) then
			print(('[DG-PEEK] Bone is invalid | Bone: %s '):format(bone))
			return false
		end
		return true
	end
	return addEntry('bones', bone, parameters, checker)
end

addFlagEntry = function(flag, parameters)
	addFlag(flag)
	return addEntry('flags', flag, parameters)
end

-- Name w/e data.id
addZoneEntry = function(zoneName, parameters)
	return addEntry('zones', zoneName, parameters)
end
--endregion

--region Removers
removeEntryById = function(entryType, id)
	debug('[DG-Peek] Removing entry | type: %s | id: %s', entryType, id)
	if not peekEntries[entryType] then
		print(('[DG-Peek] Invalid entry type | type: %s | id: %s '):format(entryType, id))
		return
	end
	if type(id) == 'table' then
		for _, _id in pairs(id) do
			removeEntryById(entryType, _id)
		end
		return
	end
	for cat, entries in pairs(peekEntries[entryType]) do
		for idx, entry in pairs(entries) do
			if entry.id == id then
				peekEntries[entryType][cat][idx] = nil
				return
			end
		end
	end
end

removeModelEntry = function(ids)
	removeEntryById('model', ids)
end

removeEntityEntry = function(ids)
	removeEntryById('entity', ids)
end

removeBoneEntry = function(ids)
	removeEntryById('bones', ids)
end

removeFlagEntry = function(ids)
	removeEntryById('flags', ids)
end

removeZoneEntry = function(ids)
	removeEntryById('zones', ids)
end
--endregion
--endregion
--endregion

--region Events
-- Events from other scripts
RegisterNetEvent('dg-lib:keyEvent', function(name, isDown)
	if name ~= 'playerPeek' then return end
	if isDown then
		enablePeek()
	else
		disablePeek()
	end
end)

RegisterNetEvent('dg-lib:targetinfo:changed', function(entity, type, coords)
	current.entity = entity
	current.type = type
	current.coords = coords
end)

RegisterNetEvent('dg-polytarget:enter', function(name, data, point)
	activeZones[name] = {
        point = point,
        data = data,
    }
end)

RegisterNetEvent('dg-polytarget:exit', function(name)
	activeZones[name] = nil
end)

-- NUI callbacks
RegisterNUICallback('closeTarget', function(_, cb)
	isFocused = false
	disablePeek()
	cb('ok')
end)

RegisterNUICallback('selectTarget', function(data, cb)
	-- We make a copy to prevent data loss when closing the UI & resetting the vars
	local entry = getEntryById(activeEntries, data.id)
	isFocused = false
	disablePeek()
	if not entry then
		print(('[DG-PEEK] Invalid entry | id: %s'):format(data.id))
		cb('ok')
		return
	end
	if entry.action then
		entry.action(entry, current.entity)
	end
	if entry.event then
		if entry.type == 'server' then
			TriggerServerEvent(entry.event, entry, current.entity)
		else
			TriggerEvent(entry.event, entry, current.entity)
		end
	end
	cb('ok')
end)
--endregion

--region Exports
-- Calling
exports['dg-lib']:registerKeyMapping('playerPeek', 'Open peek eye', '+playerPeek', '-playerPeek', Config.OpenKey, true)
-- Registering
exports('setPeekEnabled', setPeekEnabled)
exports('addModelEntry', addModelEntry)
exports('addEntityEntry', addEntityEntry)
exports('addBoneEntry', addBoneEntry)
exports('addFlagEntry', addFlagEntry)
exports('addZoneEntry', addZoneEntry)
-- Removing
exports('removeModelEntry', removeModelEntry)
exports('removeEntityEntry', removeEntityEntry)
exports('removeBoneEntry', removeBoneEntry)
exports('removeFlagEntry', removeFlagEntry)
exports('removeZoneEntry', removeZoneEntry)
--endregion