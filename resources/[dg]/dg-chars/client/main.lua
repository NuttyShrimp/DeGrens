local cam = nil
local charPed = {}
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
        DGCore.Functions.TriggerCallback("dg-chars:server:setupCharacters", function(result)
            SendNUIMessage({
                action = "setupCharacters",
                characters = result
            })
            for i=1 , 5 , 1 do
                if result[i] then
                    local model = result[i].model
                    local skin = result[i].skin
                    model = model ~= nil and tonumber(model) or false
                    Citizen.CreateThread(function()
                        RequestModel(model)
                        while not HasModelLoaded(model) do
                            Citizen.Wait(0)
                        end
                        charPed[i] = CreatePed(2, model, Config.PedLocations[i].x, Config.PedLocations[i].y, Config.PedLocations[i].z - 0.98, Config.PedLocations[i].w, false, true)
                        SetPedComponentVariation(charPed, 0, 0, 0, 2)
                        FreezeEntityPosition(charPed, false)
                        SetEntityInvincible(charPed, true)
                        PlaceObjectOnGroundProperly(charPed)
                        SetBlockingOfNonTemporaryEvents(charPed, true)
                        skindata = json.decode(tostring(skin))
                        TriggerEvent('qb-clothing:client:loadPlayerClothing', skindata, charPed)
                        Wait(100)
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
                            Wait(0)
                            DrawMarker(25, Config.PedLocations[i].x, Config.PedLocations[i].y, Config.PedLocations[i].z, 0.0, 0.0, 0.0, 0.0, 180.0, 0.0, 0.8, 0.8, 0.8, 50, 50, 50, 220, false, true, 2, nil, nil, false)
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

RegisterNUICallback('zoomToChar', function(data)
    local count = data.count
    if count then
        -- change UI
        
        -- cam move
        newCamCoords = vector3(Config.camLocations[count].x , Config.camLocations[count].y , Config.camLocations[count].z)
        newCamRot = vector3( -10, 0, Config.camLocations[count].w + 180)
        oldCamCoords = vector3(Config.standardCamCoords.x, Config.standardCamCoords.y, Config.standardCamCoords.z)
        oldCamRot =  vector3( 0, 0, Config.standardCamCoords.w)
        diffCoords = newCamCoords - oldCamCoords
        diffRot = newCamRot - oldCamRot

        for i = 1, 75, 1 do
            SetCamCoord(cam, oldCamCoords+diffCoords/75*i)
            SetCamRot(cam, oldCamRot+diffRot/75*i)
            
            Citizen.Wait(i/8)
        end


    else
    end

end)

RegisterNUICallback('zoomToMain', function(data)
    local count = data.count
    if count then
        -- change UI
        
        -- cam move
        newCamCoords = vector3(Config.standardCamCoords.x, Config.standardCamCoords.y, Config.standardCamCoords.z)
        newCamRot = vector3( 0, 0, Config.standardCamCoords.w)
        oldCamCoords = GetCamCoord(cam)
        oldCamRot =  GetCamRot(cam, 2)
        diffCoords = newCamCoords - oldCamCoords
        diffRot = newCamRot - oldCamRot

        for i = 1, 75, 1 do
            SetCamCoord(cam, oldCamCoords+diffCoords/75*i)
            SetCamRot(cam, oldCamRot+diffRot/75*i)
            
            Citizen.Wait(i/8)
        end


    else
    end

end)


-- Load Player
--TriggerServerEvent('dg-chars:server:loadUserData', cData)
-- + delete entities

-- RegisterNUICallback('disconnectButton', function()
--     SetEntityAsMissionEntity(charPed, true, true)
--     DeleteEntity(charPed)
--     TriggerServerEvent('qb-multicharacter:server:disconnect')
-- end)

-- RegisterNUICallback('selectCharacter', function(data)
--     local cData = data.cData
--     DoScreenFadeOut(10)
--     TriggerServerEvent('dg-chars:server:loadUserData', cData)
--     openCharMenu(false)
--     SetEntityAsMissionEntity(charPed, true, true)
--     DeleteEntity(charPed)
-- end)

RegisterNUICallback('removeBlur', function()
    SetTimecycleModifier('default')
end)

-- RegisterNUICallback('createNewCharacter', function(data)
--     local cData = data
--     DoScreenFadeOut(150)
--     if cData.gender == "Male" then
--         cData.gender = 0
--     elseif cData.gender == "Female" then
--         cData.gender = 1
--     end
--     TriggerServerEvent('qb-multicharacter:server:createCharacter', cData)
--     Citizen.Wait(500)
-- end)

-- RegisterNUICallback('removeCharacter', function(data)
--     TriggerServerEvent('qb-multicharacter:server:deleteCharacter', data.citizenid)
--     TriggerEvent('qb-multicharacter:client:chooseChar')
-- end)
