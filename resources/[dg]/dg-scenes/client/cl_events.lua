AddEventHandler('onResourceStart', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then return end

    DGCore.Functions.TriggerCallback('dg-scenes:server:GetScenes', function(scenes)
        allScenes = scenes
    end)
end)

RegisterNetEvent('dg-scenes:client:UpdateAllScenes', function(scenes)
    allScenes = scenes
end)

AddEventHandler("dg-lib:keyEvent", function(keyname, isDown) 
    if keyname ~= "scenes-openmenu" then return end
    if not isDown then return end

    if not activeLaser then
        SetNuiFocus(true, true)
        SendNUIMessage({action = "open"}) 
    else
        if laserCoords then
            if activeLaser == "create" then
                currentCreationData.coords = laserCoords
                TriggerServerEvent("dg-scenes:server:Create", currentCreationData)
            elseif activeLaser == "delete" then
                deleteScene(laserCoords)
            end
        else
            DGCore.Functions.Notify("Geen geldige plaats", "error")
        end

        toggleLaser()
        exports['dg-lib']:hideInteraction()
    end
end)

RegisterNUICallback('Create', function(data)
    Citizen.Wait(100)
    currentCreationData = data
    toggleLaser("create")
end)

RegisterNUICallback('Delete', function(data)
    Citizen.Wait(100)
    toggleLaser("delete")
end)

RegisterNUICallback('Close', function()
    SetNuiFocus(false, false)
end)