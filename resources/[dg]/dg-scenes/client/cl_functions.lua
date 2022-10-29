toggleLaser = function(type) 
    activeLaser = type
    if not activeLaser then return end

    -- draw laser 
    Citizen.CreateThread(function()
        local hintText = activeLaser == "create" and "Plaats" or "Verwijder"
        exports['dg-ui']:showInteraction(("%s - %s"):format(exports["dg-lib"]:GetCurrentKeyMap("+scenes-openmenu"), hintText))

        local ped = PlayerPedId()
        while activeLaser do
            local coords = DGX.RayCast.getLastHitCoord()

            if coords then
                local position = GetEntityCoords(ped)
                laserCoords = vector3(coords.x, coords.y, coords.z)
                DrawLine(position, laserCoords, 0, 240, 180, 200)
                DrawMarker(28, laserCoords, 0.0, 0.0, 0.0, 0.0, 180.0, 0.0, 0.1, 0.1, 0.1, 0, 240, 180, 200, false, true, 2, nil, nil, false) 
            else
                laserCoords = nil
            end

            Citizen.Wait(0)
        end
    end)
end

deleteScene = function(coords)
    local closestScene = nil
    local closestDistance = 1000

    for k, v in pairs(allScenes) do
        local distance =  #(coords - v.coords)
        if distance < 1 and distance < closestDistance then
            closestScene = k
            closestDistance = distance
        end
    end

    if closestScene then
        TriggerServerEvent('dg-scenes:server:Delete', closestScene)
    end
end

drawScene = function(data)
    local onScreen, screenX, screenY = GetScreenCoordFromWorldCoord(data.coords.x, data.coords.y, data.coords.z)
    if onScreen then
        local scale = (1 / #(data.coords - GetGameplayCamCoords())) * (1 / GetGameplayCamFov()) * 300 * data.size
        local r, g, b = hexToRGB(data.color)

        SetTextScale(0.0, scale)
        SetTextFont(data.style)
        SetTextProportional(true)
        SetTextColour(r, g, b, 255)
        SetTextOutline()
        SetTextEntry("STRING")
        SetTextCentre(true)
        AddTextComponentString(data.text)
        DrawText(screenX, screenY)
    end
end

hexToRGB = function(hex)
    hex = hex:gsub("#","")
    return tonumber("0x"..hex:sub(1,2)), tonumber("0x"..hex:sub(3,4)), tonumber("0x"..hex:sub(5,6))
end