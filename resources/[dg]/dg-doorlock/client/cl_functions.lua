isAuthorized = function(doorId)
	if not doors[doorId] then return false end
  for _, job in pairs(doors[doorId].authorized) do
    if job == DGX.Jobs.getCurrentJob().name or DGX.Business.isEmployee(job) then
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

-- TODO: Maybe custom sounds 
playDoorSound = function(lock)
  local door = doors[currentDoorId]
  local soundName = lock and "Remote_Control_Close" or "Remote_Control_Open"
  DGX.Sounds.playFromCoord(('doorlock_%s'):format(currentDoorId), soundName, 'PI_Menu_Sounds', door.coords, door.distance)
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