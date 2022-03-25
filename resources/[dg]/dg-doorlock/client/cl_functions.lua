isAuthorized = function(doorId)
	if not doors[doorId] or not PlayerData or not PlayerData.job then return false end
    for _, job in pairs(doors[doorId].authorized) do
        if job == PlayerData.job.name then
            return true
        end
    end
	return false 
end

getDoorId = function(entity)
	local activeDoors = DoorSystemGetActive()
	for _, door in pairs(activeDoors) do
		if door[2] == entity then
			return door[1]
		end
	end
end

loadPtfxAsset = function(asset)
    RequestNamedPtfxAsset(asset)
    while not HasNamedPtfxAssetLoaded(asset) do
        Citizen.Wait(5)
    end
end

loadModel = function(model)
    RequestModel(model)
    while not HasModelLoaded(model) do
        Citizen.Wait(5)
    end
end

loadAnimDict = function(dict)
	RequestAnimDict(dict)
	while not HasAnimDictLoaded(dict) do
		Citizen.Wait(5)
	end
end

openDoorAnim = function()
    local ped = PlayerPedId()
    if IsPedInAnyVehicle(ped, false) then return end
	loadAnimDict("anim@heists@keycard@")
	TaskPlayAnim(ped, "anim@heists@keycard@", "exit", 5.0, 1.0, -1, 16, 0, 0, 0, 0)
	SetTimeout(400, function() StopAnimTask(ped, "anim@heists@keycard@", "exit", 1.0) end)
end

-- TODO: Custom sounds
playDoorSound = function(lock)
    local door = doors[currentDoorId]
    local soundName = lock and "Remote_Control_Close" or "Remote_Control_Open"
    PlaySoundFromCoord(-1, soundName, door.coords.x, door.coords.y, door.coords.z, "PI_Menu_Sounds", 1, door.distance, 0)
end

showInteraction = function()
    if doors and doors[currentDoorId] and not doors[currentDoorId].noInteraction then
        interactionVisible = true
        if isAuthorized(currentDoorId) then
            if doors[currentDoorId].locked then
                exports['dg-ui']:showInteraction(('%s - Locked'):format(exports["dg-lib"]:GetCurrentKeyMap("+toggleDoor")), 'error')
            else
                exports['dg-ui']:showInteraction(('%s - Unlocked'):format(exports["dg-lib"]:GetCurrentKeyMap("+toggleDoor")), 'success')
            end
        else
            if doors[currentDoorId].locked then
                exports['dg-ui']:showInteraction('Locked', 'error')
            else
                exports['dg-ui']:showInteraction('Unlocked', 'success')
            end
        end
    end
end