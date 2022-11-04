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
        openApplication('scenes')
    else
        if laserCoords then
            if activeLaser == "create" then
                currentCreationData.coords = laserCoords
                TriggerServerEvent("dg-scenes:server:Create", currentCreationData)
            elseif activeLaser == "delete" then
                deleteScene(laserCoords)
            end
        else
          DGX.Notifications.add('Geen geldige plaats', 'error')
        end

        toggleLaser()
        DGX.UI.hideInteraction()
    end
end)

RegisterUICallback('scenes:create', function(data, cb)
    Citizen.Wait(100)
    currentCreationData = data
    toggleLaser("create")
    closeApplication('scenes')
    cb({data={}, meta={ok=true, message='done'}})
end)

RegisterUICallback('scenes:delete', function(_, cb)
    Citizen.Wait(100)
    toggleLaser("delete")
    closeApplication('scenes')
    cb({data={}, meta={ok=true, message='done'}})
end)