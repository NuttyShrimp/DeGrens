local camZPlus1 = 1500
local camZPlus2 = 50
local pointCamCoords = 75
local pointCamCoords2 = 0
local cam1Time = 500
local cam2Time = 1000
local choosingSpawn = false
local cam, cam2 = nil, nil
local DGCore = exports['dg-core']:GetCoreObject()

-- Functions

local function SetDisplay(bool)
    choosingSpawn = bool
    SetNuiFocus(bool, bool)
    SendNUIMessage({
        type = "ui",
        status = bool
    })
end

-- Events

RegisterNetEvent('dg-spawn:client:openUI', function(value)
    SetEntityVisible(PlayerPedId(), false)
    DoScreenFadeOut(250)
    Citizen.Wait(1000)
    DoScreenFadeIn(250)
    DGCore.Functions.GetPlayerData(function(PlayerData)     
        cam = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", PlayerData.position.x, PlayerData.position.y, PlayerData.position.z + camZPlus1, -85.00, 0.00, 0.00, 100.00, false, 0)
        SetCamActive(cam, true)
        RenderScriptCams(true, false, 1, true, true)
    end)
    Citizen.Wait(500)
    SetDisplay(value)
end)

RegisterNetEvent('qb-houses:client:setHouseConfig', function(houseConfig)
    Config.Houses = houseConfig
end)

RegisterNetEvent('dg-spawn:client:setupSpawns', function(cData, new, apps)
    if not new then
        DGCore.Functions.TriggerCallback('dg-spawn:server:getOwnedHouses', function(houses)
            local playerJob = DGCore.Functions.GetPlayerData().job.name
            local myHouses = {}
            local allSpawns = Config.Spawns
            if playerJob == "police" then
                allSpawns["policedp"] = {
                        coords = vector4(428.23, -984.28, 29.76, 3.5),
                        location = "policedp",
                        label = "PZ De Grens - Hoofd Bureau",
                    }
            end

            if playerJob == "ambulance" then
                    allSpawns["hospital"] = {
                        coords = vector4(292.69, -562.45, 43.26, 65.86),
                        location = "hospital",
                        label = "AZ De Grens - Spoedgevallen",
                    }
            end
            if playerJob == "mechanic" then
                    allSpawns["mechanic"] = {
                        coords = vector4(965.67, -987.94, 41.14, 92.38),
                        location = "mechanic",
                        label = "De Flierefluiters - Garage",
                    }
            end
            if playerJob == "lawyer" then
                    allSpawns["justice"] = {
                        coords = vector4(408.84, -1092.89, 29.4, 355.59),
                        location = "justice",
                        label = "Gerechtsgebouw De Grens",
                    }
            end

            if houses ~= nil then
                for i = 1, (#houses), 1 do
                    table.insert(myHouses, {
                        house = houses[i].house,
                        label = Config.Houses[houses[i].house].adress,
                    })
                end
            end
            Citizen.Wait(500)
            SendNUIMessage({
                action = "setupLocations",
                locations = allSpawns ,
                houses = myHouses,
            })
        end, cData.citizenid)
    elseif new then
			SetDisplay(false)
			DoScreenFadeOut(500)
			Citizen.Wait(5000)
			TriggerServerEvent('dg-apartments:server:enterApartment', nil, true)
			TriggerServerEvent('DGCore:Server:OnPlayerLoaded')
			TriggerEvent('DGCore:Client:OnPlayerLoaded')
			FreezeEntityPosition(ped, false)
			RenderScriptCams(false, true, 500, true, true)
			SetCamActive(cam, false)
			DestroyCam(cam, true)
			SetCamActive(cam2, false)
			DestroyCam(cam2, true)
			SetEntityVisible(PlayerPedId(), true)
    end
end)

-- NUI Callbacks

RegisterNUICallback("exit", function(data)
    SetNuiFocus(false, false)
    SendNUIMessage({
        type = "ui",
        status = false
    })
    choosingSpawn = false
end)

RegisterNUICallback('setCam', function(data)
    local location = tostring(data.posname)
    local type = tostring(data.type)

    DoScreenFadeOut(200)
    Citizen.Wait(500)
    DoScreenFadeIn(200)

    if DoesCamExist(cam) then
        DestroyCam(cam, true)
    end

    if DoesCamExist(cam2) then
        DestroyCam(cam2, true)
    end

    if type == "current" then
        DGCore.Functions.GetPlayerData(function(PlayerData)
            cam2 = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", PlayerData.position.x, PlayerData.position.y, PlayerData.position.z + camZPlus1, 300.00,0.00,0.00, 110.00, false, 0)
            PointCamAtCoord(cam2, PlayerData.position.x, PlayerData.position.y, PlayerData.position.z + pointCamCoords)
            SetCamActiveWithInterp(cam2, cam, cam1Time, true, true)
            -- SetCamActiveWithInterp(camTo, camFrom, duration, easeLocation, easeRotation)
            if DoesCamExist(cam) then
                DestroyCam(cam, true)
            end
            Citizen.Wait(cam1Time)

            cam = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", PlayerData.position.x, PlayerData.position.y, PlayerData.position.z + camZPlus2, 300.00,0.00,0.00, 110.00, false, 0)
            PointCamAtCoord(cam, PlayerData.position.x, PlayerData.position.y, PlayerData.position.z + pointCamCoords2)
            SetCamActiveWithInterp(cam, cam2, cam2Time, true, true)
            SetEntityCoords(PlayerPedId(), PlayerData.position.x, PlayerData.position.y, PlayerData.position.z)
        end)
    elseif type == "house" then
        local campos = Config.Houses[location].coords.enter

        cam2 = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", campos.x, campos.y, campos.z + camZPlus1, 300.00,0.00,0.00, 110.00, false, 0)
        PointCamAtCoord(cam2, campos.x, campos.y, campos.z + pointCamCoords)
        SetCamActiveWithInterp(cam2, cam, cam1Time, true, true)
        if DoesCamExist(cam) then
            DestroyCam(cam, true)
        end
        Citizen.Wait(cam1Time)

        cam = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", campos.x, campos.y, campos.z + camZPlus2, 300.00,0.00,0.00, 110.00, false, 0)
        PointCamAtCoord(cam, campos.x, campos.y, campos.z + pointCamCoords2)
        SetCamActiveWithInterp(cam, cam2, cam2Time, true, true)
        SetEntityCoords(PlayerPedId(), campos.x, campos.y, campos.z)
    elseif type == "normal" then
        local campos = Config.Spawns [location].coords

        cam2 = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", campos.x, campos.y, campos.z + camZPlus1, 300.00,0.00,0.00, 110.00, false, 0)
        PointCamAtCoord(cam2, campos.x, campos.y, campos.z + pointCamCoords)
        SetCamActiveWithInterp(cam2, cam, cam1Time, true, true)
        if DoesCamExist(cam) then
            DestroyCam(cam, true)
        end
        Citizen.Wait(cam1Time)

        cam = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", campos.x, campos.y, campos.z + camZPlus2, 300.00,0.00,0.00, 110.00, false, 0)
        PointCamAtCoord(cam, campos.x, campos.y, campos.z + pointCamCoords2)
        SetCamActiveWithInterp(cam, cam2, cam2Time, true, true)
        SetEntityCoords(PlayerPedId(), campos.x, campos.y, campos.z)
    elseif type == "appartment" then
        local campos = exports['dg-apartments']:getEnterCoords()

        cam2 = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", campos.x, campos.y, campos.z + camZPlus1, 300.00,0.00,0.00, 110.00, false, 0)
        PointCamAtCoord(cam2, campos.x, campos.y, campos.z + pointCamCoords)
        SetCamActiveWithInterp(cam2, cam, cam1Time, true, true)
        if DoesCamExist(cam) then
            DestroyCam(cam, true)
        end
        Citizen.Wait(cam1Time)

        cam = CreateCamWithParams("DEFAULT_SCRIPTED_CAMERA", campos.x, campos.y, campos.z + camZPlus2, 300.00,0.00,0.00, 110.00, false, 0)
        PointCamAtCoord(cam, campos.x, campos.y, campos.z + pointCamCoords2)
        SetCamActiveWithInterp(cam, cam2, cam2Time, true, true)
        SetEntityCoords(PlayerPedId(), campos.x, campos.y, campos.z)
    end
end)

RegisterNUICallback('chooseAppa', function(data)
    local appaYeet = data.appType
    SetDisplay(false)
    DoScreenFadeOut(500)
    Citizen.Wait(5000)
    TriggerServerEvent("dg-apartments:server:enterApartment", appaYeet)
    TriggerServerEvent('DGCore:Server:OnPlayerLoaded')
    TriggerEvent('DGCore:Client:OnPlayerLoaded')
    FreezeEntityPosition(ped, false)
    RenderScriptCams(false, true, 500, true, true)
    SetCamActive(cam, false)
    DestroyCam(cam, true)
    SetCamActive(cam2, false)
    DestroyCam(cam2, true)
    SetEntityVisible(PlayerPedId(), true)
end)

RegisterNUICallback('spawnplayer', function(data)
    local location = tostring(data.spawnloc)
    local type = tostring(data.typeLoc)
    local ped = PlayerPedId()
    local PlayerData = DGCore.Functions.GetPlayerData()
    local insideMeta = PlayerData.metadata["inside"]

    if type == "current" then
        SetDisplay(false)
        DoScreenFadeOut(500)
        Citizen.Wait(2000)
        DGCore.Functions.GetPlayerData(function(PlayerData)
            SetEntityCoords(PlayerPedId(), PlayerData.position.x, PlayerData.position.y, PlayerData.position.z)
            SetEntityHeading(PlayerPedId(), PlayerData.position.a)
            FreezeEntityPosition(PlayerPedId(), false)
        end)

        if insideMeta.house ~= nil then
            local houseId = insideMeta.house
            TriggerEvent('qb-houses:client:LastLocationHouse', houseId)
        elseif insideMeta.apartment.id ~= nil then
            TriggerServerEvent('dg-apartments:server:enterApartment', insideMeta.apartment.id)
        end
        TriggerServerEvent('DGCore:Server:OnPlayerLoaded')
        TriggerEvent('DGCore:Client:OnPlayerLoaded')
        FreezeEntityPosition(ped, false)
        RenderScriptCams(false, true, 500, true, true)
        SetCamActive(cam, false)
        DestroyCam(cam, true)
        SetCamActive(cam2, false)
        DestroyCam(cam2, true)
        SetEntityVisible(PlayerPedId(), true)
        Citizen.Wait(500)
        DoScreenFadeIn(250)
    elseif type == "house" then
        SetDisplay(false)
        DoScreenFadeOut(500)
        Citizen.Wait(2000)
        TriggerEvent('qb-houses:client:enterOwnedHouse', location)
        TriggerServerEvent('DGCore:Server:OnPlayerLoaded')
        TriggerEvent('DGCore:Client:OnPlayerLoaded')
        TriggerServerEvent('qb-houses:server:SetInsideMeta', 0, false)
        TriggerServerEvent('dg-apartments:server:setInsideMeta', 0)
        FreezeEntityPosition(ped, false)
        RenderScriptCams(false, true, 500, true, true)
        SetCamActive(cam, false)
        DestroyCam(cam, true)
        SetCamActive(cam2, false)
        DestroyCam(cam2, true)
        SetEntityVisible(PlayerPedId(), true)
        Citizen.Wait(500)
        DoScreenFadeIn(250)
    elseif type == "normal" then
        local pos = Config.Spawns [location].coords
        SetDisplay(false)
        DoScreenFadeOut(500)
        Citizen.Wait(2000)
        SetEntityCoords(ped, pos.x, pos.y, pos.z)
        TriggerServerEvent('DGCore:Server:OnPlayerLoaded')
        TriggerEvent('DGCore:Client:OnPlayerLoaded')
        TriggerServerEvent('qb-houses:server:SetInsideMeta', 0, false)
			TriggerServerEvent('dg-apartments:server:setInsideMeta', 0)
        Citizen.Wait(500)
        SetEntityCoords(ped, pos.x, pos.y, pos.z)
        SetEntityHeading(ped, pos.w)
        FreezeEntityPosition(ped, false)
        RenderScriptCams(false, true, 500, true, true)
        SetCamActive(cam, false)
        DestroyCam(cam, true)
        SetCamActive(cam2, false)
        DestroyCam(cam2, true)
        SetEntityVisible(PlayerPedId(), true)
        Citizen.Wait(500)
        DoScreenFadeIn(250)
    end
end)

-- Threads

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        if choosingSpawn then
            DisableAllControlActions(0)
        else
            Citizen.Wait(1000)
        end
    end
end)