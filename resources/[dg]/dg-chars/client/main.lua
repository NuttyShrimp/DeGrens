local cam = nil
local movingCam = false
local charPed = {}
local charLoc = {}
local DGCore = exports['dg-core']:GetCoreObject()
local CanDraw = false
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
            for k , resultChar in pairs(result) do
                SendNUIMessage({
                    action = "setupCharacter",
                    character = resultChar
                })
                        charLoc[resultChar.cid] = true
                        local model = resultChar.model
                        local skin = resultChar.skin
                        model = model ~= nil and tonumber(model) or false
                        Citizen.CreateThread(function()
                            RequestModel(model)
                            while not HasModelLoaded(model) do
                                Citizen.Wait(0)
                            end
                            charPed[resultChar.cid] = CreatePed(2, model, Config.PedLocations[resultChar.cid].x, Config.PedLocations[resultChar.cid].y, Config.PedLocations[resultChar.cid].z - 0.98, Config.PedLocations[resultChar.cid].w, false, true)
                            SetPedComponentVariation(charPed[resultChar.cid], 0, 0, 0, 2)
                            FreezeEntityPosition(charPed[resultChar.cid], false)
                            SetEntityInvincible(charPed[resultChar.cid], true)
                            PlaceObjectOnGroundProperly(charPed[resultChar.cid])
                            SetBlockingOfNonTemporaryEvents(charPed[resultChar.cid], true)
                            skindata = json.decode(tostring(skin))
                            TriggerEvent('qb-clothing:client:loadPlayerClothing', skindata, charPed[resultChar.cid])
                            Wait(100)
                        end)
            end
            for i=1, 5, 1 do
                    if not charLoc[i] then
                        SendNUIMessage({
                            action = "setupEmpty",
                            count = i
                        })
                        Citizen.CreateThread(function()
                            CanDraw = true
                            local randommodels = {
                                "mp_m_freemode_01",
                                "mp_f_freemode_01",
                            }
                            local model = GetHashKey(randommodels[math.random(1, #randommodels)])
                            RequestModel(model)
                            while not HasModelLoaded(model) do
                                Citizen.Wait(0)
                            end
                            charPed[i] = CreatePed(2, model, Config.PedLocations[i].x, Config.PedLocations[i].y, Config.PedLocations[i].z - 0.98, Config.PedLocations[i].w, false, true)
                            SetPedComponentVariation(charPed[i], 0, 0, 0, 2)
                            FreezeEntityPosition(charPed[i], false)
                            SetEntityInvincible(charPed[i], true)
                            PlaceObjectOnGroundProperly(charPed[i])
                            SetBlockingOfNonTemporaryEvents(charPed[i], true)
                            SetEntityAlpha(charPed[i], 10)
                        end)
                        CreateThread(function()
                            while CanDraw == true do
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

function moveCam(newCoords, newRot)
	oldCamCoords = GetCamCoord(cam)
	oldCamRot = GetCamRot(cam)
	if(movingCam or (newCoords == oldCamCoords and newRot == oldCamRot)) then return end
	movingCam = true
	diffCoords = newCoords-GetCamCoord(cam)
	diffRot = newRot-oldCamRot
	if diffRot.z > 180 then
		diffRot = diffRot - vector3(0,0,360)
	end
	for i = 1, 75, 1 do
		SetCamCoord(cam, oldCamCoords+diffCoords/75*i)
		SetCamRot(cam, oldCamRot+diffRot/75*i)
		Citizen.Wait(i/8)
	end
	movingCam = false
end

function deleteCharEntities()
    CanDraw = false
    for i,char in pairs(charPed) do
        DeleteEntity(char)
    end
    charLoc = {}
    charPed = {}
end

function DirectionVector(rotation)
	local z = math.rad(rotation.z)
	local x = math.rad(rotation.x)
	local abscos = math.abs(math.cos(x))

	local vec3dir = vector3(-math.sin(z)*abscos, math.cos(z)*abscos, math.sin(x))
	return vec3dir
end

function DeleteCamera()
	DestroyAllCams(true)
	RenderScriptCams(false, true, 1, true, true)
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

RegisterNetEvent('dg-chars:client:closeNUI', function()
    DeleteCamera()
    SetNuiFocus(false, false)
end)

-- NUI Callbacks

RegisterNUICallback('closeUI', function()
    DeleteCamera()
    openCharMenu(false)
end)

RegisterNUICallback('zoomToChar', function(data)
    local count = data.count
    if count then
        ped = charPed[count]
        newCamCoords = GetEntityCoords(ped) + vector3(1, 0.0,0.35) + DirectionVector(GetEntityRotation(ped)) * 3
        newCamRot = GetEntityRotation(ped)+vector3(-10,0,180)
        moveCam(newCamCoords, newCamRot)
        TaskLookAtCoord(ped, newCamCoords, -1, 0, 2)
    else
    end
end)

RegisterNUICallback('zoomToMain', function()
        
        newCamCoords = vector3(Config.CamCoords.x, Config.CamCoords.y, Config.CamCoords.z)
        newCamRot = vector3( -20, 0, Config.CamCoords.h)
        moveCam(newCamCoords, newCamRot)

end)

RegisterNUICallback('disconnect', function()
    deleteCharEntities()
    TriggerServerEvent('dg-char:server:disconnect')
end)

RegisterNUICallback('play', function(data)
    local citizenid = data.citizenid
    local count = data.id
    TriggerServerEvent('dg-chars:server:loadUserData', citizenid)
    openCharMenu(false)
    SetEntityAsMissionEntity(charPed[count], true, true)
    deleteCharEntities()
end)

RegisterNUICallback('removeBlur', function()
    SetTimecycleModifier('default')
end)

RegisterNUICallback('removeCharacter', function(data)
    openCharMenu(false)
    deleteCharEntities()
    TriggerServerEvent('dg-chars:server:deleteCharacter', data.citizenid)
    TriggerEvent('dg-chars:client:chooseChar')
end)

RegisterNUICallback('createNewCharacter', function(data)
    local cData = data
    local count = data.cid
    local model = nil

    if cData.gender == "0" then
        model = GetHashKey("mp_m_freemode_01")
       
    elseif cData.gender == "1" then
        model = GetHashKey("mp_f_freemode_01")
    end

    RequestModel(model)
    while not HasModelLoaded(model) do
        Citizen.Wait(0)
    end
    
    SetPlayerModel(PlayerId(), model)
    SetPedComponentVariation(GetPlayerPed(-1), 0, 0, 0, 2)
    SetEntityRotation(PlayerPedId(), 0, 0, Config.PedLocations[count].w)
    SetEntityCoords(PlayerPedId(), Config.PedLocations[count].x, Config.PedLocations[count].y, Config.PedLocations[count].z)
    deleteCharEntities()
    Citizen.Wait(500)
    TriggerServerEvent('dg-chars:server:createCharacter', cData)
end)

RegisterNUICallback('validationMsg', function(data)
    local text = data.text
    local type = "error"
    local length = 5000
    DGCore.Functions.Notify(text, type, length)
end)
