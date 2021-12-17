DGCore = exports['dg-core']:GetCoreObject()
currentCops = 0
currentStore = nil

RegisterNetEvent('police:SetCopCount', function(amount) currentCops = amount end)

Citizen.CreateThread(function()
    DGCore.Functions.TriggerCallback("dg-storerobbery:server:GetConfig", function(data)
        openedRegisters = data.openedRegisters
        openedSafes = data.openedSafes
    end)
end)

Citizen.CreateThread(function()
    for _, store in pairs(Config.Stores) do
        local registerzone = store.registerzone
        registerzone.options.data = registerzone.options.data or {}
        registerzone.options.data.id = store.name
        exports["dg-lib"]:AddBoxZone("registers", registerzone.center, registerzone.length, registerzone.width, registerzone.options)
    end

    local storezone = Config.Stores["grove_street"].storezone
    storezone.options.data = storezone.options.data or {}
    storezone.options.data.id = Config.Stores["grove_street"].name
    exports["dg-lib"]:AddPolyZone("store", storezone.vectors, storezone.options)
end)

function GainStress()
    local rng = math.random(1, 100)
    if rng <= Config.GainStressChance then
        TriggerServerEvent('hud:server:GainStress', math.random(2, 5))
    end
end

function CreateEvidence()
    local rng = math.random(1, 100)
    if rng <= Config.FingerdropChance and not true then -- HANDSHOES
        local ped = PlayerPedId()
        local pos = GetEntityCoords(ped)
        TriggerServerEvent("evidence:server:CreateFingerDrop", pos)
    end
end

function LoadAnimDict(dict)
    while not HasAnimDictLoaded(dict) do
        RequestAnimDict(dict)
        Citizen.Wait(10)
    end
end

function CallCops(store)
    local ped = PlayerPedId()
    local pos = GetEntityCoords(ped)
    local s1, s2 = GetStreetNameAtCoord(pos.x, pos.y, pos.z)
    local streetLabel = s2 and GetStreetNameFromHashKey(s1)..' '..GetStreetNameFromHashKey(s2) or GetStreetNameFromHashKey(s1)
    TriggerServerEvent("dg-storerobbery:server:CallCops", store, streetLabel, pos)
end

RegisterNetEvent("dg-polyzone:enter", function(name, data, center)
    if name == "registers" then
        EnteredRegistersZone()
    elseif name == "store" then
        currentStore = data.id
        EnteredSafeZone()
    end
end)

RegisterNetEvent("dg-polyzone:exit", function(name)
    if name == "registers" then
        LeftRegistersZone()
    elseif name == "store" then
        currentStore = nil
        LeftSafeZone()
    end
end)

RegisterNetEvent("dg-storerobbery:client:PoliceAlert", function(store, streetLabel, coords)
    PlaySound(-1, "Lose_1st", "GTAO_FM_Events_Soundset", 0, 0, 1)
    TriggerEvent('dg-policealerts:client:AddPoliceAlert', {
        timeOut = 5000,
        alertTitle = "Poging Winkeloverval",
        coords = {x = coords.x, y = coords.y, z = coords.z},
        details = {
            [1] = {icon = '<i class="fas fa-video"></i>', detail = Config.Stores[store].cam},
            [2] = {icon = '<i class="fas fa-globe-europe"></i>', detail = streetLabel}
        },
        callSign = DGCore.Functions.GetPlayerData().metadata["callsign"]
    })

    local transG = 250
    local blip = AddBlipForCoord(coords.x, coords.y, coords.z)
    SetBlipSprite(blip, 458)
    SetBlipColour(blip, 1)
    SetBlipDisplay(blip, 4)
    SetBlipAlpha(blip, transG)
    SetBlipScale(blip, 1.0)
    BeginTextCommandSetBlipName('STRING')
    AddTextComponentString("Poging Winkeloverval")
    EndTextCommandSetBlipName(blip)

    while transG ~= 0 do
        Wait(180 * 4)
        transG = transG - 1
        SetBlipAlpha(blip, transG)
        if transG == 0 then
            SetBlipSprite(blip, 2)
            RemoveBlip(blip)
            return
        end
    end
end)








-- function takeAnim()
--     local ped = PlayerPedId()
--     while (not HasAnimDictLoaded("amb@prop_human_bum_bin@idle_b")) do
--         RequestAnimDict("amb@prop_human_bum_bin@idle_b")
--         Citizen.Wait(100)
--     end
--     TaskPlayAnim(ped, "amb@prop_human_bum_bin@idle_b", "idle_d", 8.0, 8.0, -1, 50, 0, false, false, false)
--     Citizen.Wait(2500)
--     TaskPlayAnim(ped, "amb@prop_human_bum_bin@idle_b", "exit", 8.0, 8.0, -1, 50, 0, false, false, false)
-- end

