local DGCore = exports['dg-core']:GetCoreObject()
local inside = false
local currentHouse = nil
local closestHouse
local inRange
local lockpicking = false
local houseObj = {}
local POIOffsets = nil
local usingAdvanced = false
local requiredItemsShowed = false
local requiredItems = {}
local CurrentCops = 0

RegisterNetEvent('DGCore:Client:OnPlayerLoaded', function()
    DGCore.Functions.TriggerCallback('qb-houserobbery:server:GetHouseConfig', function(HouseConfig)
        Config.Houses = HouseConfig
    end)
end)

function DrawText3Ds(x, y, z, text)
	SetTextScale(0.35, 0.35)
    SetTextFont(4)
    SetTextProportional(1)
    SetTextColour(255, 255, 255, 215)
    SetTextEntry("STRING")
    SetTextCentre(true)
    AddTextComponentString(text)
    SetDrawOrigin(x,y,z, 0)
    DrawText(0.0, 0.0)
    local factor = (string.len(text)) / 370
    DrawRect(0.0, 0.0+0.0125, 0.017+ factor, 0.03, 0, 0, 0, 75)
    ClearDrawOrigin()
end

CreateThread(function()
    Citizen.Wait(500)
    requiredItems = {
        "lockpick",
        "screwdriverset",
    }

    while true do
        inRange = false
        local PlayerPed = PlayerPedId()
        local PlayerPos = GetEntityCoords(PlayerPed)
        closestHouse = nil
        if DGCore ~= nil then
            local hours = GetClockHours()
            if hours >= Config.MinimumTime or hours <= Config.MaximumTime then
                if not inside then
                    for k, v in pairs(Config.Houses) do
                        dist = #(PlayerPos - vector3(Config.Houses[k]["coords"]["x"], Config.Houses[k]["coords"]["y"], Config.Houses[k]["coords"]["z"]))
                        if dist <= 1.5 then
                            closestHouse = k
                            inRange = true
                            if CurrentCops >= Config.MinimumHouseRobberyPolice then
                                if Config.Houses[k]["opened"] then
                                    DrawText3Ds(Config.Houses[k]["coords"]["x"], Config.Houses[k]["coords"]["y"], Config.Houses[k]["coords"]["z"], '~g~E~w~ - To Enter')
                                    if IsControlJustPressed(0, 38) then
                                        enterRobberyHouse(k)
                                    end
                                else
                                    if not requiredItemsShowed then
                                        requiredItemsShowed = true
                                        TriggerEvent('inventory:client:requiredItems', requiredItems, true)
                                    end
                                end
                            end
                        end
                    end
                end
            end
            if inside then Wait(1000) end
            if not inRange then
                if requiredItemsShowed then
                    requiredItemsShowed = false
                    TriggerEvent('inventory:client:requiredItems', requiredItems, false)
                end
                Wait(1000)
            end
        end
        Wait(5)
    end
end)

CreateThread(function()
    while true do
        local ped = PlayerPedId()
        local pos = GetEntityCoords(ped)

        if inside then
            if #(pos - vector3(Config.Houses[currentHouse]["coords"]["x"] + POIOffsets.exit.x, Config.Houses[currentHouse]["coords"]["y"] + POIOffsets.exit.y, Config.Houses[currentHouse]["coords"]["z"] - Config.MinZOffset + POIOffsets.exit.z)) < 1.5 then
                DrawText3Ds(Config.Houses[currentHouse]["coords"]["x"] + POIOffsets.exit.x, Config.Houses[currentHouse]["coords"]["y"] + POIOffsets.exit.y, Config.Houses[currentHouse]["coords"]["z"] - Config.MinZOffset + POIOffsets.exit.z, '~g~E~w~ - To leave home')
                if IsControlJustPressed(0, 38) then
                    leaveRobberyHouse(currentHouse)
                end
            end

            for k, v in pairs(Config.Houses[currentHouse]["furniture"]) do
                if #(pos - vector3(Config.Houses[currentHouse]["coords"]["x"] + Config.Houses[currentHouse]["furniture"][k]["coords"]["x"], Config.Houses[currentHouse]["coords"]["y"] + Config.Houses[currentHouse]["furniture"][k]["coords"]["y"], Config.Houses[currentHouse]["coords"]["z"] + Config.Houses[currentHouse]["furniture"][k]["coords"]["z"] - Config.MinZOffset)) < 1 then
                    if not Config.Houses[currentHouse]["furniture"][k]["searched"] then
                        if not Config.Houses[currentHouse]["furniture"][k]["isBusy"] then
                            DrawText3Ds(Config.Houses[currentHouse]["coords"]["x"] + Config.Houses[currentHouse]["furniture"][k]["coords"]["x"], Config.Houses[currentHouse]["coords"]["y"] + Config.Houses[currentHouse]["furniture"][k]["coords"]["y"], Config.Houses[currentHouse]["coords"]["z"] + Config.Houses[currentHouse]["furniture"][k]["coords"]["z"] - Config.MinZOffset, '~g~E~w~ - '..Config.Houses[currentHouse]["furniture"][k]["text"])
                            if not IsLockpicking then
                                if IsControlJustReleased(0, 38) then
                                    searchCabin(k)
                                end
                            end
                        else
                            DrawText3Ds(Config.Houses[currentHouse]["coords"]["x"] + Config.Houses[currentHouse]["furniture"][k]["coords"]["x"], Config.Houses[currentHouse]["coords"]["y"] + Config.Houses[currentHouse]["furniture"][k]["coords"]["y"], Config.Houses[currentHouse]["coords"]["z"] + Config.Houses[currentHouse]["furniture"][k]["coords"]["z"] - Config.MinZOffset, 'Searching..')
                        end
                    else
                        DrawText3Ds(Config.Houses[currentHouse]["coords"]["x"] + Config.Houses[currentHouse]["furniture"][k]["coords"]["x"], Config.Houses[currentHouse]["coords"]["y"] + Config.Houses[currentHouse]["furniture"][k]["coords"]["y"], Config.Houses[currentHouse]["coords"]["z"] + Config.Houses[currentHouse]["furniture"][k]["coords"]["z"] - Config.MinZOffset, 'Empty..')
                    end
                end
            end
        end

        if not inside then 
            Wait(5000)
        end
        Wait(3)
    end
end)

function enterRobberyHouse(house)
    TriggerServerEvent("InteractSound_SV:PlayOnSource", "houses_door_open", 0.25)
    openHouseAnim()
    Wait(250)
    local coords = { x = Config.Houses[house]["coords"]["x"], y = Config.Houses[house]["coords"]["y"], z= Config.Houses[house]["coords"]["z"] - Config.MinZOffset}
    if Config.Houses[house]["tier"] == 1 then
        data = exports['qb-interior']:CreateHouseRobbery(coords)
    end
    Wait(100)
    houseObj = data[1]
    POIOffsets = data[2]
    inside = true
    currentHouse = house
    Wait(500)
    TriggerEvent('dg-weathersync:client:DisableSync')
end

function leaveRobberyHouse(house)
    local ped = PlayerPedId()
    TriggerServerEvent("InteractSound_SV:PlayOnSource", "houses_door_open", 0.25)
    openHouseAnim()
    Wait(250)
    DoScreenFadeOut(250)
    Wait(500)
    exports['qb-interior']:DespawnInterior(houseObj, function()
        TriggerEvent('dg-weathersync:client:EnableSync')
        Wait(250)
        DoScreenFadeIn(250)
        SetEntityCoords(ped, Config.Houses[house]["coords"]["x"], Config.Houses[house]["coords"]["y"], Config.Houses[house]["coords"]["z"] + 0.5)
        SetEntityHeading(ped, Config.Houses[house]["coords"]["h"])
        inside = false
        currentHouse = nil
    end)
end

RegisterNetEvent('qb-houserobbery:client:ResetHouseState', function(house)
    Config.Houses[house]["opened"] = false
    for k, v in pairs(Config.Houses[house]["furniture"]) do
        v["searched"] = false
    end
end)

RegisterNetEvent('police:SetCopCount', function(amount)
    CurrentCops = amount
end)

RegisterNetEvent('qb-houserobbery:client:enterHouse', function(house)
    enterRobberyHouse(house)
end)

function openHouseAnim()
    loadAnimDict("anim@heists@keycard@") 
    TaskPlayAnim( PlayerPedId(), "anim@heists@keycard@", "exit", 5.0, 1.0, -1, 16, 0, 0, 0, 0 )
    Wait(400)
    ClearPedTasks(PlayerPedId())
end

function loadAnimDict(dict)
    while (not HasAnimDictLoaded(dict)) do
        RequestAnimDict(dict)
        Wait(5)
    end
end

RegisterNetEvent('lockpicks:UseLockpick', function(isAdvanced)
    local hours = GetClockHours()
    if hours >= Config.MinimumTime or hours <= Config.MaximumTime then
        usingAdvanced = isAdvanced
        if usingAdvanced then
            if closestHouse ~= nil then
                if CurrentCops >= Config.MinimumHouseRobberyPolice then
                    if not Config.Houses[closestHouse]["opened"] then
                        PoliceCall()
                        TriggerEvent('qb-lockpick:client:openLockpick', lockpickFinish)
                        if math.random(1, 100) <= 85 and not IsWearingHandshoes() then
                            local pos = GetEntityCoords(PlayerPedId())
                            TriggerServerEvent("evidence:server:CreateFingerDrop", pos)
                        end
                    else
                        DGCore.Functions.Notify('The door is already open..', 'error', 3500)
                    end
                else
                    DGCore.Functions.Notify('Not enough Police..', 'error', 3500)
                end
            end
        else
            DGCore.Functions.TriggerCallback('DGCore:HasItem', function(result)
                if closestHouse ~= nil then
                    if result then
                        if CurrentCops >= Config.MinimumHouseRobberyPolice then
                            if not Config.Houses[closestHouse]["opened"] then
                                PoliceCall()
                                TriggerEvent('qb-lockpick:client:openLockpick', lockpickFinish)
                                if math.random(1, 100) <= 85 and not IsWearingHandshoes() then
                                    local pos = GetEntityCoords(PlayerPedId())
                                    TriggerServerEvent("evidence:server:CreateFingerDrop", pos)
                                end
                            else
                                DGCore.Functions.Notify('The door is already open..', 'error', 3500)
                            end
                        else
                            DGCore.Functions.Notify('Not enough Police..', 'error', 3500)
                        end
                    else
                        DGCore.Functions.Notify('It looks like you are missing something...', 'error', 3500)
                    end
                end
            end, "screwdriverset")
        end
    end
end)

function PoliceCall()
    local pos = GetEntityCoords(PlayerPedId())
    local chance = 75
    if GetClockHours() >= 1 and GetClockHours() <= 6 then
        chance = 25
    end
    if math.random(1, 100) <= chance then
        local closestPed = GetNearbyPed()
        if closestPed ~= nil then
            local s1, s2 = GetStreetNameAtCoord(pos.x, pos.y, pos.z, Citizen.PointerValueInt(), Citizen.PointerValueInt())
            local streetLabel = GetStreetNameFromHashKey(s1)
            local street2 = GetStreetNameFromHashKey(s2)
            if street2 ~= nil and street2 ~= "" then 
                streetLabel = streetLabel .. " " .. street2
            end
            local gender = "Man"
            if DGCore.Functions.GetPlayerData().charinfo.gender == 1 then
                gender = "Woman"
            end
            local msg = "Attempted burglary into a house by one " .. gender .." at " .. streetLabel
            TriggerServerEvent("police:server:HouseRobberyCall", pos, msg, gender, streetLabel)
        end
    end
end

function GetNearbyPed()
	local retval = nil
	local PlayerPeds = {}
    for _, player in ipairs(GetActivePlayers()) do
        local ped = GetPlayerPed(player)
        table.insert(PlayerPeds, ped)
    end
    local player = PlayerPedId()
    local coords = GetEntityCoords(player)
	local closestPed, closestDistance = DGCore.Functions.GetClosestPed(coords, PlayerPeds)
	if not IsEntityDead(closestPed) and closestDistance < 50.0 then
		retval = closestPed
	end
	return retval
end

function lockpickFinish(success)
    if success then
        TriggerServerEvent('qb-houserobbery:server:enterHouse', closestHouse)
        DGCore.Functions.Notify('It worked!', 'success', 2500)
    else
        if usingAdvanced then
            if math.random(1, 100) < 20 then
                TriggerServerEvent("DGCore:Server:RemoveItem", "advancedlockpick", 1)
                TriggerEvent('inventory:client:ItemBox', "advancedlockpick", "remove")
            end
        else
            if math.random(1, 100) < 40 then
                TriggerServerEvent("DGCore:Server:RemoveItem", "lockpick", 1)
                TriggerEvent('inventory:client:ItemBox', "advancedlockpick", "remove")
            end
        end
        
        DGCore.Functions.Notify('It did not work..', 'error', 2500)
    end
end

RegisterNetEvent('qb-houserobbery:client:setHouseState', function(house, state)
    Config.Houses[house]["opened"] = state
end)

local openingDoor = false
local SucceededAttempts = 0
local NeededAttempts = 4

function searchCabin(cabin)
    local ped = PlayerPedId()

    local Skillbar = exports['qb-skillbar']:GetSkillbarObject()
    if math.random(1, 100) <= 85 and not IsWearingHandshoes() then
        local pos = GetEntityCoords(PlayerPedId())
        TriggerServerEvent("evidence:server:CreateFingerDrop", pos)
    end
    LockpickDoorAnim(lockpickTime)
    TriggerServerEvent('qb-houserobbery:server:SetBusyState', cabin, currentHouse, true)

    FreezeEntityPosition(ped, true)

    IsLockpicking = true

    Skillbar.Start({
        duration = math.random(7500, 15000),
        pos = math.random(10, 30),
        width = math.random(10, 20),
    }, function()
        if SucceededAttempts + 1 >= NeededAttempts then
            -- Finish
            openingDoor = false
            ClearPedTasks(PlayerPedId())
            TriggerServerEvent('qb-houserobbery:server:searchCabin', cabin, currentHouse)
            Config.Houses[currentHouse]["furniture"][cabin]["searched"] = true
            TriggerServerEvent('qb-houserobbery:server:SetBusyState', cabin, currentHouse, false)
            SucceededAttempts = 0
            FreezeEntityPosition(ped, false)
            SetTimeout(500, function()
                IsLockpicking = false
            end)
        else
            -- Repeat
            Skillbar.Repeat({
                duration = math.random(700, 1250),
                pos = math.random(10, 40),
                width = math.random(10, 13),
            })
            SucceededAttempts = SucceededAttempts + 1
        end
    end, function()
        -- Fail
        openingDoor = false
        ClearPedTasks(PlayerPedId())
        TriggerServerEvent('qb-houserobbery:server:SetBusyState', cabin, currentHouse, false)
        DGCore.Functions.Notify("Process Canceled..", "error")
        SucceededAttempts = 0
        FreezeEntityPosition(ped, false)
        SetTimeout(500, function()
            IsLockpicking = false
        end)
    end)
end

function LockpickDoorAnim(time)
    -- time = time / 1000
    -- loadAnimDict("veh@break_in@0h@p_m_one@")
    -- TaskPlayAnim(PlayerPedId(), "veh@break_in@0h@p_m_one@", "low_force_entry_ds" ,3.0, 3.0, -1, 16, 0, false, false, false)
    openingDoor = true
    CreateThread(function()
        while true do
            if openingDoor then
                TaskPlayAnim(PlayerPedId(), "veh@break_in@0h@p_m_one@", "low_force_entry_ds", 3.0, 3.0, -1, 16, 0, 0, 0, 0)
            else
                StopAnimTask(PlayerPedId(), "veh@break_in@0h@p_m_one@", "low_force_entry_ds", 1.0)
                break
            end
            Wait(1000)
        end
    end)
end

RegisterNetEvent('qb-houserobbery:client:setCabinState', function(house, cabin, state)
    Config.Houses[house]["furniture"][cabin]["searched"] = state
end)

RegisterNetEvent('qb-houserobbery:client:SetBusyState', function(cabin, house, bool)
    Config.Houses[house]["furniture"][cabin]["isBusy"] = bool
end)

function IsWearingHandshoes()
    local armIndex = GetPedDrawableVariation(PlayerPedId(), 3)
    local model = GetEntityModel(PlayerPedId())
    local retval = true
    if model == GetHashKey("mp_m_freemode_01") then
        if Config.MaleNoHandshoes[armIndex] ~= nil and Config.MaleNoHandshoes[armIndex] then
            retval = false
        end
    else
        if Config.FemaleNoHandshoes[armIndex] ~= nil and Config.FemaleNoHandshoes[armIndex] then
            retval = false
        end
    end
    return retval
end

RegisterCommand('gethroffset', function()
    local coords = GetEntityCoords(PlayerPedId())
    local houseCoords = vector3(
        Config.Houses[currentHouse]["coords"]["x"],
        Config.Houses[currentHouse]["coords"]["y"],
        Config.Houses[currentHouse]["coords"]["z"] - Config.MinZOffset
    )
    if inside then
        local xdist = coords.x - houseCoords.x
        local ydist = coords.y - houseCoords.y
        local zdist = coords.z - houseCoords.z
        print('X: '..xdist)
        print('Y: '..ydist)
        print('Z: '..zdist)
    end
end)
