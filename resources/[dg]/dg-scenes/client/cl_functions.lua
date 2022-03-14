toggleLaser = function(type) 
    activeLaser = type
    if not activeLaser then return end

    -- draw laser 
    Citizen.CreateThread(function()
        local hintText = activeLaser == "create" and "Plaats" or "Verwijder"
        exports['dg-lib']:showInteraction(("%s - %s"):format(exports["dg-lib"]:GetCurrentKeyMap("+scenes-openmenu"), hintText))

        local ped = PlayerPedId()
        while activeLaser do
            local hit, coords = rayCastCam()

            if hit then
                local position = GetEntityCoords(ped)
                DrawLine(position.x, position.y, position.z, coords.x, coords.y, coords.z, 0, 240, 180, 200)
                DrawMarker(28, coords.x, coords.y, coords.z, 0.0, 0.0, 0.0, 0.0, 180.0, 0.0, 0.1, 0.1, 0.1, 0, 240, 180, 200, false, true, 2, nil, nil, false) 
                laserCoords = coords
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

rotationToDirection = function(degrees)
	local rad = (math.pi / 180) * degrees
    local direction = vector3(
        -math.sin(rad.z) * math.abs(math.cos(rad.x)), 
        math.cos(rad.z) * math.abs(math.cos(rad.x)), 
        math.sin(rad.x)
    )
	return direction
end

rayCastCam = function()
	local origin = GetGameplayCamCoord()
	local direction = rotationToDirection(GetGameplayCamRot())
	local target = origin + direction * 25.0
	local _, hit, coords, _, _ = GetShapeTestResult(StartShapeTestRay(origin, target, -1, PlayerPedId(), 0))
	return hit == 1, coords
end

hexToRGB = function(hex)
    hex = hex:gsub("#","")
    return tonumber("0x"..hex:sub(1,2)), tonumber("0x"..hex:sub(3,4)), tonumber("0x"..hex:sub(5,6))
end