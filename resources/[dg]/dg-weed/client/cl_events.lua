AddEventHandler("onResourceStart", function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end

    activePlants = DGCore.Functions.TriggerCallback("dg-weed:server:GetPlants")
end)

RegisterNetEvent('onResourceStop', function(resourceName)
	if GetCurrentResourceName() ~= resourceName then return end

    -- remove peek entries
    exports["dg-peek"]:removeModelEntry(cacheIds.generalPlant)
    exports["dg-peek"]:removeModelEntry(cacheIds.cutPlant)

    -- remove existing plants
    for k, plant in pairs(activePlants) do
        if plant.object and DoesEntityExist(plant.object) then
            SetEntityAsMissionEntity(plant.object, true, true)
            DeleteObject(plant.object)
        end
    end
end)

RegisterNetEvent("dg-weed:client:Plant", function(gender)
    local ped = PlayerPedId()
    local plantCoords = GetOffsetFromEntityInWorldCoords(ped, 0, 0.75, 0)

    local closestPlantDistance = 1000
    for k, plant in pairs(activePlants) do
        local distance = #(plant.coords - GetEntityCoords(ped))
        if distance < closestPlantDistance then
            closestPlantDistance = distance
        end
    end

    if closestPlantDistance > 2 then
        if isAcceptedLocation(plantCoords) then
            local wasCancelled, _ = exports['dg-misc']:Taskbar("shovel", 'Planten...', 1000, {
              canCancel = true,
              cancelOnDeath = true,
              controlDisables = {
                movement = true,
                carMovement = true,
                combat = true,
              },
              animation = {
                animDict = "amb@world_human_gardener_plant@male@base",
                anim = "base",
                flags = 16,
              }
            })
            ClearPedTasks(ped) 
            if wasCancelled then
              DGCore.Functions.Notify("Canceled...", "error")
              return
            end
            TriggerServerEvent("dg-weed:server:PlacePlant", plantCoords, gender)
        else
            DGCore.Functions.Notify("Geen goede ondergrond", "error")
        end
    else
        DGCore.Functions.Notify("Te dicht bij een andere plant", "error")
    end
end)

RegisterNetEvent("dg-weed:client:AddPlant", function(id, plant)
    activePlants[id] = plant
end)

RegisterNetEvent("dg-weed:client:UpdatePlantData", function(data)
    for index, plant in pairs(activePlants) do
        local oldStage = plant.data.stage
        activePlants[index].data = data[index]

        -- if new stage then respawn the object
        if plant.object and oldStage ~= data[index].stage then 
            respawnPlantObject(index)
        end
    end
end)

RegisterNetEvent("dg-weed:client:RemovePlant", function(index)
    if activePlants[index].object then
        despawnPlantObject(index)
    end
    activePlants[index] = nil
end)