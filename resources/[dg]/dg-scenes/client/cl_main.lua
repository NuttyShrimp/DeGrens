allScenes = {}
local closeScenes = {}
activeLaser = nil

currentCreationData = {}
laserCoords = nil

-- Check if scenes are close enough to draw
Citizen.CreateThread(function()
    while true do
        closeScenes = {}
        local ped = PlayerPedId()
        local pos = GetEntityCoords(ped)

        for _, v in pairs(allScenes) do
            if #(pos - v.coords) < v.distance * 3 then
                closeScenes[#closeScenes+1] = v
            end
        end

        Citizen.Wait(1000)
    end
end)

-- Draw close scenes
Citizen.CreateThread(function()
    while true do
        local sleep = 1000
        local ped = PlayerPedId()
        local pos = GetEntityCoords(ped)

        if next(closeScenes) then
            sleep = 0

            for _, v in pairs(closeScenes) do
                local distance = #(pos - v.coords)
                if distance <= v.distance then
                    drawScene(v)
                end
            end
        end

        -- draw scene while creating
        if next(currentCreationData) and laserCoords and activeLaser == "create" then
            sleep = 0
            currentCreationData.coords = laserCoords
            drawScene(currentCreationData)
        end

        Citizen.Wait(sleep)
    end
end)

exports['dg-lib']:registerKeyMapping('scenes-openmenu', 'Scene menu openen', '+scenes-openmenu', '-scenes-openmenu', Config.SceneKey, true)