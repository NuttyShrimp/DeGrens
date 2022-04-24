cacheIds = {}

local activeLabs = {}
currentLabId = nil
local boxAttached = false

AddEventHandler('onClientResourceStart', function(resourceName)
	if resourceName ~= GetCurrentResourceName() then return end

    DGCore.Functions.TriggerCallback("dg-labs:server:GetLabCoords", function(coords)
        for k, v in pairs(coords) do
            Config.Labs[k].coords = v
        end
    end)

    Citizen.Wait(3 * 1000) -- wait for doors to load etc bullshit OIIFKJHJFHJF

    DGCore.Functions.TriggerCallback("dg-labs:server:GetActiveLabs", function(active)
        activeLabs = active
        for labType, labId in pairs(activeLabs) do
            local lab = Config.Labs[labId]

            -- Load interior
            local hash = GetInteriorAtCoords(lab.coords)
            RefreshInterior(hash)
            for _, prop in ipairs(Config.Types[labType].interiorProps) do
                ActivateInteriorEntitySet(hash, prop)
            end

            -- Unlock door
            TriggerServerEvent("dg-doorlock:server:changeDoorLockState", lab.doorId, false)

            -- Create polyzone
            exports['dg-polyzone']:AddBoxZone("drugslab", lab.coords, 19.0, 28.0, {
                heading = lab.heading,
                minZ = lab.coords.z - 3,
                maxZ = lab.coords.z + 6,
                debugPoly = false,
                data = {
                    id = labId,
                }
            })

            -- Set default data
        end

        print("LABS LOADED")
    end)
end)

AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end

    for labType, labId in pairs(activeLabs) do
        local data = Config.Labs[labId]
        local hash = GetInteriorAtCoords(data.coords)
        RefreshInterior(hash)
        for _, prop in ipairs(Config.Types[labType].interiorProps) do
            DeactivateInteriorEntitySet(hash, prop)
        end

        TriggerServerEvent("dg-doorlock:server:changeDoorLockState", data.doorId, true)

        exports["dg-polyzone"]:removeZone("drugslab")
    end

    if currentLabId then 
        destroyPeekZones(currentLabId)
    end
end)

RegisterNetEvent("dg-polyzone:enter", function(name, data, center)
    if name ~= "drugslab" then return end
    
    currentLabId = data.id
    buildPeekZones(currentLabId)
end)

RegisterNetEvent("dg-polyzone:exit", function(name)
    if name ~= "drugslab" then return end

    if currentLabId then 
        destroyPeekZones(currentLabId)
    end
    
    currentLabId = nil
end)

getLabTypeFromId = function(id)
    local retval = nil
    for labType, labId in pairs(activeLabs) do
        if labId == id then
            retval = labType
            break
        end
    end
    return retval
end

buildPeekZones = function(labId)
    local labType = getLabTypeFromId(labId)
    if not labType then return end 

    local heading = Config.Labs[labId].heading * (math.pi / 180)
    for k, v in pairs(Config.Types[labType].peekZones) do
        local xOffset = v.x * math.cos(heading) - v.y * math.sin(heading)
        local yOffset = v.x * math.sin(heading) + v.y * math.cos(heading)
        local coords = Config.Labs[labId].coords + vector3(xOffset, yOffset, v.z)

        exports['dg-polytarget']:AddCircleZone("drugslab_action", coords, 0.5, {
            useZ = true,
            debugPoly = false,
            data = {
                action = k,
            }
        })
    end

    if labType == "meth" then
        addMethPeekEntries()
    elseif labType == "coke" then
        -- TODO Cokelab
    elseif labType == "weed" then
        addWeedPeekEntries()
    end
end

destroyPeekZones = function(labId)
    local labType = getLabTypeFromId(labId)
    if not labType then return end
    for _, _ in pairs(Config.Types[labType].peekZones) do
        exports['dg-polytarget']:removeZone("drugslab_action")
    end
    exports['dg-peek']:removeZoneEntry(cacheIds)
end

loadAnimDict = function(dict)
    RequestAnimDict(dict)
    while not HasAnimDictLoaded(dict) do
        Citizen.Wait(10)
    end
end

attachBox = function()
    if boxAttached then return end
    exports['dg-propattach']:addItem('cardbox')
    boxAttached = true
    Citizen.CreateThread(function()
        local ped = PlayerPedId()
        loadAnimDict("anim@heists@box_carry@")
        while boxAttached do
            if not IsEntityPlayingAnim(ped, "anim@heists@box_carry@", "idle", 3) then
                TaskPlayAnim(ped, "anim@heists@box_carry@", "idle", 2.0, 2.0, -1, 51, 0, false, false, false)
            end
            Citizen.Wait(100)
        end
        StopAnimTask(ped, "anim@heists@box_carry@", "idle", 1.0)
    end)
end

removeBox = function()
    if not boxAttached then return end
    exports['dg-propattach']:removeItem('cardbox')
    boxAttached = false
end