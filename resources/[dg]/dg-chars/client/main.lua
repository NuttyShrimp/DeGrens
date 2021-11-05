local cam = nil
local charPed = nil
local DGCore = exports['dg-core']:GetCoreObject()

-- Main Thread

Citizen.CreateThread(function()
	while true do
		Citizen.Wait(0)
		if NetworkIsSessionStarted() then
			TriggerEvent('dg-chars:client:chooseChar')
			return
		end
	end
end)

-- Functions

local function skyCam(bool)
    TriggerEvent('dg-weathersync:client:DisableSync')
    if bool then
        DoScreenFadeIn(1000)
        SetTimecycleModifier('hud_def_blur')
        SetTimecycleModifierStrength(1.0)
        FreezeEntityPosition(PlayerPedId(), false)

        cam =  CreateCam('DEFAULT_SCRIPTED_CAMERA', 1)
        SetCamCoord(cam, Config.CamCoords.x, Config.CamCoords.y, Config.CamCoords.z)
        SetCamActive(cam, true)
        SetCamRot(cam, -20.0,0,Config.CamCoords.h)
        StopCamShaking(cam, true)
        SetCamFov(cam, 50.0)
        SetCamActive(cam, true)
        RenderScriptCams(true, false, 1, true, true)
    else
        SetTimecycleModifier('default')
        SetCamActive(cam, false)
        DestroyCam(cam, true)
        RenderScriptCams(false, false, 1, true, true)
        FreezeEntityPosition(PlayerPedId(), false)
    end
end

local function setPeds(bool)
    if bool then
        SendNUIMessage({
            action = "setupCharacters",
            characters = result
        })
        DGCore.Functions.TriggerCallback("dg-chars:server:setupCharacters", function(result)
            SendNUIMessage({
                action = "setupCharacters",
                characters = result
            })
            for i=1 , 5 , 1 do
                if result[i] then
                    model = result[i].model
                    data = result[i].skin
                    model = model ~= nil and tonumber(model) or false
                    Citizen.CreateThread(function()
                        RequestModel(model)
                        while not HasModelLoaded(model) do
                            Citizen.Wait(0)
                        end
                        charPed = CreatePed(2, model, Config.PedLocations[i].x, Config.PedLocations[i].y, Config.PedLocations[i].z - 0.98, Config.PedLocations[i].w, false, true)
                        SetPedComponentVariation(charPed, 0, 0, 0, 2)
                        FreezeEntityPosition(charPed, false)
                        SetEntityInvincible(charPed, true)
                        PlaceObjectOnGroundProperly(charPed)
                        SetBlockingOfNonTemporaryEvents(charPed, true)
                        data = json.decode(data)
                        TriggerEvent('qb-clothing:client:loadPlayerClothing', data, charPed)
                     end)
                else
                    -- Citizen.CreateThread(function()
                    --     local randommodels = {
                    --         "mp_m_freemode_01",
                    --         "mp_f_freemode_01",
                    --     }
                    --     local model = GetHashKey(randommodels[math.random(1, #randommodels)])
                    --     RequestModel(model)
                    --     while not HasModelLoaded(model) do
                    --         Citizen.Wait(0)
                    --     end
                    --     charPed = CreatePed(2, model, Config.PedLocations[i].x, Config.PedLocations[i].y, Config.PedLocations[i].z - 0.98, Config.PedLocations[i].w, false, true)
                    --     SetPedComponentVariation(charPed, 0, 0, 0, 2)
                    --     FreezeEntityPosition(charPed, false)
                    --     SetEntityInvincible(charPed, true)
                    --     PlaceObjectOnGroundProperly(charPed)
                    --     SetBlockingOfNonTemporaryEvents(charPed, true)
                    -- end)
                    CreateThread(function()
                        while true do
                            -- draw every frame
                            Wait(0)
                            DrawMarker(25, Config.PedLocations[i].x, Config.PedLocations[i].y, Config.PedLocations[i].z, 0.0, 0.0, 0.0, 0.0, 180.0, 0.0, 0.8, 0.8, 0.8, 50, 50, 50, 200, false, true, 2, nil, nil, false)
                        end
                    end)
                end
            end
    
        end)
    end
end

local function openCharMenu(bool)
    SetNuiFocus(bool, bool)
    SendNUIMessage({
        action = "ui",
        toggle = bool,
    })
    setPeds(bool)
    skyCam(bool)
end

-- Events

RegisterNetEvent('qb-multicharacter:client:closeNUIdefault', function() -- This event is only for no starting apartments
    SetNuiFocus(false, false)
    DoScreenFadeOut(500)
    Citizen.Wait(2000)
    SetEntityCoords(PlayerPedId(), Config.DefaultSpawn.x, Config.DefaultSpawn.y, Config.DefaultSpawn.z)
    TriggerServerEvent('DGCore:Server:OnPlayerLoaded')
    TriggerEvent('DGCore:Client:OnPlayerLoaded')
    TriggerServerEvent('qb-houses:server:SetInsideMeta', 0, false)
    TriggerServerEvent('qb-apartments:server:SetInsideMeta', 0, 0, false)
    Citizen.Wait(500)
    openCharMenu()
    SetEntityVisible(PlayerPedId(), true)
    Citizen.Wait(500)
    DoScreenFadeIn(250)
    TriggerEvent('dg-weathersync:client:EnableSync')
    TriggerEvent('qb-clothes:client:CreateFirstCharacter')
end)

RegisterNetEvent('qb-multicharacter:client:closeNUI', function()
    SetNuiFocus(false, false)
end)

RegisterNetEvent('dg-chars:client:chooseChar', function()
    SetNuiFocus(false, false)
    DoScreenFadeOut(10)
    Citizen.Wait(1000)
    FreezeEntityPosition(PlayerPedId(), true)
    SetEntityCoords(PlayerPedId(), Config.HiddenCoords.x, Config.HiddenCoords.y, Config.HiddenCoords.z)
    Citizen.Wait(1500)
    ShutdownLoadingScreen()
    ShutdownLoadingScreenNui()
    openCharMenu(true)
end)

-- NUI Callbacks

RegisterNUICallback('closeUI', function()
    openCharMenu(false)
end)

RegisterNUICallback('disconnectButton', function()
    SetEntityAsMissionEntity(charPed, true, true)
    DeleteEntity(charPed)
    TriggerServerEvent('qb-multicharacter:server:disconnect')
end)

RegisterNUICallback('selectCharacter', function(data)
    local cData = data.cData
    DoScreenFadeOut(10)
    TriggerServerEvent('qb-multicharacter:server:loadUserData', cData)
    openCharMenu(false)
    SetEntityAsMissionEntity(charPed, true, true)
    DeleteEntity(charPed)
end)

RegisterNUICallback('removeBlur', function()
    SetTimecycleModifier('default')
end)

RegisterNUICallback('createNewCharacter', function(data)
    local cData = data
    DoScreenFadeOut(150)
    if cData.gender == "Male" then
        cData.gender = 0
    elseif cData.gender == "Female" then
        cData.gender = 1
    end
    TriggerServerEvent('qb-multicharacter:server:createCharacter', cData)
    Citizen.Wait(500)
end)

RegisterNUICallback('removeCharacter', function(data)
    TriggerServerEvent('qb-multicharacter:server:deleteCharacter', data.citizenid)
    TriggerEvent('qb-multicharacter:client:chooseChar')
end)
