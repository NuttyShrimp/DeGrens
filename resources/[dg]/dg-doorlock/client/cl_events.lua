RegisterNetEvent('dg-jobs:signin:update', function(name, rank)
  plyJob = {name = name, rank = rank}
end)

RegisterNetEvent("onResourceStop", function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    if interactionVisible then 
        exports["dg-ui"]:hideInteraction()
    end
end)

RegisterNetEvent('dg-lib:keyEvent', function(name)
	if name ~= 'toggleDoor' then return end
    if Debounce("toggleDoorState", 500) then return end -- limits usage to once every half second

	if currentDoorId and #(GetEntityCoords(PlayerPedId()) - currentDoorCoords) <= doors[currentDoorId].distance then
		if isAuthorized(currentDoorId) then
            print(("TOGGLE DOOR %s"):format(currentDoorId))
            if not doors[currentDoorId].noAnimation then openDoorAnim() end
            if doors[currentDoorId].playSound then playDoorSound(not currentDoorLockState) end
			TriggerServerEvent("dg-doorlock:server:changeDoorLockState", currentDoorId, not currentDoorLockState)
		end
	end
end)

RegisterNetEvent("dg-doorlock:client:changeDoorLockState", function(doorId, doorLockState)
	if doors and doors[doorId] and IsDoorRegisteredWithSystem(doorId) then
		doors[doorId].locked = doorLockState
		DoorSystemSetAutomaticRate(doorId, 1.0, 0, 0)
		DoorSystemSetDoorState(doorId, doorLockState, false, true)

		if doorId == currentDoorId then
			currentDoorLockState = doorLockState
            showInteraction()
		end
	else
		print(("--DOOR NOT FOUND ID:%s--"):format(doorId))
	end
end)

RegisterNetEvent("lib:raycast:entityChanged", function(entity, entityType, entityCoords)
    if inPolyZone then return end
	if entity and entityType == 3 then
        local doorId = getDoorId(entity)
        if doorId then
            currentDoorId = doorId
            currentDoorCoords = exports['dg-lib']:tableToVector(entityCoords)
            currentDoorLockState = DoorSystemGetDoorState(doorId) ~= 0 and true or false

            if doors[doorId] then
                local ped = PlayerPedId()
                while #(GetEntityCoords(ped) - currentDoorCoords) > doors[doorId].distance and currentDoorId == doorId do
                    Citizen.Wait(50)
                end

                if #(GetEntityCoords(ped) - currentDoorCoords) <= doors[doorId].distance then
                    if not interactionVisible then
                        showInteraction()
                    end
                    return
                end
            end
        end
	else
		currentDoorId = nil
        currentDoorCoords = vector3(0,0,0)
        currentDoorLockState = nil
	end

    if interactionVisible then
        interactionVisible = false
        exports["dg-ui"]:hideInteraction()
    end
end)

RegisterNetEvent("dg-polyzone:enter", function(name, data, center)
	if name ~= "doorlock" then return end
    inPolyZone = true

    currentDoorId = data.id
    currentDoorCoords = center
    currentDoorLockState = DoorSystemGetDoorState(data.id) ~= 0 and true or false

    if not interactionVisible then
        showInteraction()
    end
end)

RegisterNetEvent("dg-polyzone:exit", function(name)
	if name ~= "doorlock" then return end
    inPolyZone = false

    currentDoorId = nil
    currentDoorCoords = vector3(0,0,0)
    currentDoorLockState = nil

    if interactionVisible then
        interactionVisible = false
        exports["dg-ui"]:hideInteraction()
    end
end)

RegisterNetEvent("lockpick:UseLockpick", function() 
    local pos = GetEntityCoords(PlayerPedId())
    for k, v in pairs(doors) do 
        if v.lockpickable and v.locked and #(pos - v.coords) < 1.5 then
            exports["dg-keygame"]:OpenGame(function(success)
                if success then
                    TriggerServerEvent("dg-doorlock:server:changeDoorLockState", k, not doors[k].locked)
                end
            end, amount, difficulty)
        end
    end  
end) 

RegisterNetEvent("thermite:UseThermite", function()
    local ped = PlayerPedId()
    local pos = GetEntityCoords(ped)

    local nearThermiteableDoor = false
    for k, v in pairs(doors) do 
        if v.thermiteable and v.locked and #(pos - v.coords) < 1.5 then
            nearThermiteableDoor = k
            break
        end
    end  
    if not nearThermiteableDoor then return end

    local data = doors[nearThermiteableDoor].thermiteable
    DGX.Inventory.removeItemFromPlayer('thermite')

    loadModel(`hei_p_m_bag_var22_arm_s`)
    loadModel(`hei_prop_heist_thermite`)
    loadAnimDict("anim@heists@ornate_bank@thermal_charge")
    loadPtfxAsset("scr_ornate_heist")

    SetEntityCoords(ped, data.ped.x, data.ped.y, pos.z - 1, false, false, false, false)
    pos = GetEntityCoords(ped)
    local rotation = GetEntityRotation(ped)
    local scene = NetworkCreateSynchronisedScene(pos.x, pos.y, pos.z, rotation.x, rotation.y, data.ped.heading, 2, false, false, 1065353216, 0, 1.3)

    local bagObject = CreateObject(`hei_p_m_bag_var22_arm_s`, pos.x, pos.y, pos.z, true, true, false)
    SetEntityCollision(bagObject, false, true)
    NetworkAddPedToSynchronisedScene(ped, scene, "anim@heists@ornate_bank@thermal_charge", "thermal_charge", 1.5, -4.0, 1, 16, 1148846080, 0)
    NetworkAddEntityToSynchronisedScene(bagObject, scene, "anim@heists@ornate_bank@thermal_charge", "bag_thermal_charge", 4.0, -8.0, 1)
    NetworkStartSynchronisedScene(scene)
    Citizen.Wait(1500)

    local thermiteObject = CreateObject(`hei_prop_heist_thermite`, pos.x, pos.y, pos.z + 0.2, true, true, true)
    SetEntityCollision(thermiteObject, false, true)
    AttachEntityToEntity(thermiteObject, ped, GetPedBoneIndex(ped, 28422), 0, 0, 0, 0, 0, 200.0, true, true, false, true, 1, true)
    Citizen.Wait(4000)

    DeleteObject(bagObject)
    DetachEntity(thermiteObject, true, true)
    FreezeEntityPosition(thermiteObject, true)
    TaskPlayAnim(ped, "anim@heists@ornate_bank@thermal_charge", "cover_eyes_intro", 8.0, 8.0, 1000, 36, 1, 0, 0, 0)
    TaskPlayAnim(ped, "anim@heists@ornate_bank@thermal_charge", "cover_eyes_loop", 8.0, 8.0, 3000, 49, 1, 0, 0, 0)

    exports["dg-sequencegame"]:OpenGame(function(success)
        if success then
            local netId = NetworkGetNetworkIdFromEntity(thermiteObject)
            local particleId = DGX.Particle.add({
              dict = 'scr_ornate_heist', 
              name = 'scr_heist_ornate_thermal_burn', 
              looped = true, 
              netId = netId, 
              offset = {x = 0, y = 0.65, z = 0},
              scale = 0.7
            })
            Citizen.Wait(10000)
            DGX.Particle.remove(particleId)
            TriggerServerEvent("dg-doorlock:server:changeDoorLockState", nearThermiteableDoor, false)
        end

        ClearPedTasks(ped)
        if DoesEntityExist(thermiteObject) then
            NetworkRequestControlOfEntity(thermiteObject)
            DeleteEntity(thermiteObject)
        end
        NetworkStopSynchronisedScene(scene)
    end, data.grid, data.amount)
end)