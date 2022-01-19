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
local canPeek, isPeeking, isFocused, generatedIds = true, false, false, 1

--region Functions
setPeekEnabled = function(isEnabled)
	canPeek = isEnabled
end

enablePeek = function()
	local ped = PlayerPedId()
	if not canPeek or isPeeking then
		return
	end
	SendNUIMessage({ response = "openTarget" })
	isPeeking = true
	generateCurrentEntries(true)
	startCheckThread()
	startControlThread()
end

disablePeek = function(onlyNui)
	if isFocused then
		return
	end
	SendNUIMessage({ response = "closeTarget" })
	SetNuiFocusKeepInput(false)
	SetNuiFocus(false, false)
	if onlyNui then
		return
	end
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
	if isFocused then
		return
	end
	if not hasActiveEntries() then
		return
	end
	isFocused = true
	SetCursorLocation(0.5, 0.5)
	SetNuiFocus(true, true)
	SetNuiFocusKeepInput(true)
	SendNUIMessage({ response = "showOptions" })
end

-- Entry logic
--region Helpers
hasActiveEntries = function()
	local hasActiveEntries = false
	for _, entry in pairs(activeEntries) do
		if #entry > 0 then
			hasActiveEntries = true
			break
		end
	end
	return hasActiveEntries
end
addNewEntry = function(cat, entry)
	if entry.job then
		if type(entry.job) == 'string' then
			if not PlayerData.job.name == entry.job then
				return
			end
		end
		if type(entry.job) == 'table' then
			if entry.job[0] then
				if not isItemInArray(entry.job, PlayerData.job.name) then
					return
				end
			else
				local reqGrade = getValueFromTable(entry.job, PlayerData.job.grade)
				if not reqGrade or reqGrade > PlayerData.job.grade then
					return
				end
			end
		end
	end
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
	table.insert(activeEntries[cat], entry)
	refreshList()
end
refreshList = function()
	-- Send refreshedList to UI
	if not hasActiveEntries() then
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
getEntryById = function(id)
	for sub, entries in pairs(activeEntries) do
		for _, entry in ipairs(entries) do
			if tonumber(entry.id) == tonumber(id) then
				return entry
			end
		end
	end
end
--endregion
--region Thread creators
startCheckThread = function()
	CreateThread(function()
		local ped = PlayerPedId()
		while isPeeking and not isFocused and current.entity do
			local coords = GetEntityCoords(current.entity)
			-- Check for bones
			for bone, entries in pairs(activeEntries.bones) do
				local boneId = GetEntityBoneIndexByName(current.entity, bone)
				local bonePos = GetWorldPositionOfEntityBone(entity, boneId)
				for _, entry in ipairs(entries) do
					activeEntries.bones[bone].disabled = false
					local dist = #(current.coords - bonePos)
					if boneId == -1 or dist > entry.distance then
						activeEntries.bones[bone].disabled = true
					end
				end
			end
			-- Check canInteract
			for cat, options in pairs(activeEntries) do
				for idx, entry in ipairs(options) do
					if entry.canInteract then
						activeEntries[cat][idx].disabled = not entry.canInteract(current.entity, entry.distance, entry)
					end
				end
			end
			Wait(150)
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

generateCurrentEntries = function(doZone)
	local ped = PlayerPedId()
	local plyCoords = GetEntityCoords(ped)
	if current.entity then
		local context = getContext(current.entity, current.type)
		activeEntries.model = {}
		activeEntries.entity = {}
		activeEntries.bones = {}
		activeEntries.flags = {}
		if peekEntries.model[context.model] then
			for _, entry in ipairs(peekEntries.model[context.model]) do
				if #(plyCoords - current.coords) <= entry.distance and (entry.canInteract and entry.canInteract(current.entity, entry.distance, entry) or false) then
					addNewEntry('model', entry)
				end
			end
		end
		if NetworkGetNetworkIdFromEntity(current.entity) then
			local netId = NetworkGetNetworkIdFromEntity(current.entity)
			if peekEntries.entity[netId] then
				for _, entry in ipairs(peekEntries.entity[netId]) do
					if #(plyCoords - current.coords) <= entry.distance and (entry.canInteract and entry.canInteract(netId, entry.distance, entry) or false) then
						addNewEntry('entity', entry)
					end
				end
			end
		end
		for flag, active in pairs(context.flags) do
			if peekEntries.flags[flag] and active then
				for _, entry in ipairs(peekEntries.flags[flag]) do
					if #(plyCoords - current.coords) <= entry.distance and (entry.canInteract and entry.canInteract(current.entity, entry.distance, entry) or false) then
						addNewEntry('flags', entry)
					end
				end
			end
		end
		for bone, entries in pairs(peekEntries.bones) do
			local boneId = GetEntityBoneIndexByName(current.entity, bone)
			if boneId ~= -1 then
				local bonePos = GetWorldPositionOfEntityBone(current.entity, boneId)
				for idx, entry in ipairs(entries) do
					if #(plyCoords - bonePos) <= entry.distance and (entry.canInteract and entry.canInteract(current.entity, entry.distance, entry) or false) then
						entry.disabled = true
						addNewEntry('bones', entry)
					end
				end
			end
		end
	end
	if doZone then
		activeEntries.zones = {}
		for zone, active in pairs(activeZones) do
			if active and peekEntries.zones[zone] then
				for index, entry in ipairs(peekEntries.zones[zone]) do
					metadata = {
						name = zone,
						index = index,
					}
					entry._metadata = metadata
					addNewEntry("zones", entry)
				end
			end
		end
	end
	refreshList()
end

updateEntityList = function()
	if not isPeeking or isFocused then
		return
	end
	if current.entity == nil then
		activeEntries.entity = {}
		activeEntries.model = {}
		activeEntries.bones = {}
		activeEntries.flags = {}
		refreshList()
		return
	end
	generateCurrentEntries(false)
end

updateZoneList = function(zoneName, data)
	if not isPeeking or isFocused then
		return
	end
	if not peekEntries.zones[zoneName] then
		return
	end

	if data then
		for index, entry in ipairs(peekEntries.zones[zoneName]) do
			metadata = {
				name = zoneName,
				index = index,
			}
			if isEntryInList(activeEntries.zones, metadata) then
				return
			end
			entry._metadata = metadata
			entry.data = entry.data and combineTables(entry.data, data) or data
			addNewEntry("zones", entry)
		end
		return
	end

	for idx, entry in ipairs(activeEntries.zones) do
		if entry._metadata.name == zoneName then
			print("removing zone entry", zoneName)
			table.remove(activeEntries.zones, idx)
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
			combineTables(newIds, addEntry(entryType, v, parameters))
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
		option.id = generatedIds
		table.insert(newIds, option.id)
		generatedIds = generatedIds + 1
		table.insert(peekEntries[entryType][key], option)
	end
	return newIds
end
addModelEntry = function(model, parameters)
	if type(model) == 'table' then
		local ids = {}
		for _, v in pairs(model) do
			combineTables(addModelEntry(v, parameters), ids)
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
removeEntryById = function(type, id)
	if not peekEntries[type] then
		print(('[DG-Peek] Invalid entry type | type: %s | id: %s '):format(type, id))
		return
	end
	if type(id) == 'table' then
		for _, _id in pairs(id) do
			removeEntryById(type, _id)
		end
		return
	end
	for cat, entries in pairs(peekEntries[type]) do
		for idx, entry in pairs(entries) do
			if entry.id == id then
				peekEntries[type][cat][idx] = nil
				return
			end
		end
	end
end
removeModelEntry = function(ids)
	removeEntryById('model', ids)
	generateCurrentEntries()
end
removeEntityEntry = function(ids)
	removeEntryById('entity', ids)
	generateCurrentEntries()
end
removeBoneEntry = function(ids)
	removeEntryById('bones', ids)
	generateCurrentEntries()
end
removeFlagEntry = function(ids)
	removeEntryById('flags', ids)
	generateCurrentEntries()
end
removeZoneEntry = function(ids)
	removeEntryById('zones', ids)
	generateCurrentEntries(true)
end
--endregion
--endregion
--endregion
--region Events
RegisterNetEvent('dg-lib:keyEvent', function(name, isDown)
	if name ~= 'playerPeek' then
		return
	end
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
	updateEntityList()
end)

RegisterNetEvent('dg-polytarget:enter', function(name, data)
	activeZones[name] = true
	updateZoneList(name, data)
end)

RegisterNetEvent('dg-polytarget:exit', function(name)
	activeZones[name] = nil
	updateZoneList(name, false)
end)

RegisterNUICallback('closeTarget', function(_, cb)
	isFocused = false
	disablePeek()
	cb('ok')
end)

RegisterNUICallback('selectTarget', function(data, cb)
	-- We make a copy to prevent data loss when closing the UI & resetting the vars
	disablePeek(true)
	local entry = getEntryById(data.id)
	isFocused = false
	if not entry then
		print(('[DG-PEEK] Invalid entry | id: %s'):format(data.id))
		disablePeek(false)
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
	disablePeek(false)
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