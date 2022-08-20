local isLoggedIn = false
local CurrentCops = 0
local copsCalled = false

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(1000 * 45 * 5)
        if copsCalled then
            copsCalled = false
        end
    end
end)

local requiredItemsShowed = false
local requiredItemsShowed2 = false
local requiredItems = {}
local currentSpot = 0
local usingSafe = false

Citizen.CreateThread(function()
    while true do 
        Citizen.Wait(1)
        if isLoggedIn then
            local pos = GetEntityCoords(PlayerPedId())
            if #(pos - vector3(Config.Locations["thermite"].x, Config.Locations["thermite"].y,Config.Locations["thermite"].z)) < 3.0 and not Config.Locations["thermite"].isDone then
                DrawMarker(2, Config.Locations["thermite"].x, Config.Locations["thermite"].y,Config.Locations["thermite"].z, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.25, 0.25, 0.1, 255, 255, 255, 100, 0, 0, 0, 1, 0, 0, 0)
                if #(pos - vector3(Config.Locations["thermite"].x, Config.Locations["thermite"].y,Config.Locations["thermite"].z)) < 1.0 then
                    if not Config.Locations["thermite"].isDone then 
                        if not requiredItemsShowed then
                            requiredItems = {
                                "thermite"
                            }
                            requiredItemsShowed = true
                            TriggerEvent('inventory:client:requiredItems', requiredItems, true)
                        end
                    end
                end
            else
                if requiredItemsShowed then
                    requiredItems = {
                        "thermite"
                    }
                    requiredItemsShowed = false
                    TriggerEvent('inventory:client:requiredItems', requiredItems, false)
                end
            end
        else
            Citizen.Wait(3000)
        end
    end
end)

Citizen.CreateThread(function()
    local inRange = false
    while true do
        Citizen.Wait(1) 
        if isLoggedIn then
            local pos = GetEntityCoords(PlayerPedId())
            for spot, location in pairs(Config.Locations["takeables"]) do
                local dist = #(pos - vector3(Config.Locations["takeables"][spot].x, Config.Locations["takeables"][spot].y,Config.Locations["takeables"][spot].z))
                if dist < 1.0 then
                    inRange = true
                    if dist < 0.6 then
                        if not requiredItemsShowed2 then
                            requiredItems = {
                                "advancedlockpick"
                            }
                            requiredItemsShowed2 = true
                            TriggerEvent('inventory:client:requiredItems', requiredItems, true)
                        end
                        if not Config.Locations["takeables"][spot].isBusy and not Config.Locations["takeables"][spot].isDone then
                            DrawText3Ds(Config.Locations["takeables"][spot].x, Config.Locations["takeables"][spot].y,Config.Locations["takeables"][spot].z, '~g~E~w~ To grab item')
                            if IsControlJustPressed(0, 38) then
                                if CurrentCops >= 0 then
                                    if Config.Locations["thermite"].isDone then 
                                        -- DGCore.Functions.TriggerCallback('DGCore:HasItem', function(hasItem)
                                        --     if hasItem then
                                        --         currentSpot = spot
                                        --         GrabItem(currentSpot)
                                        --     else
                                        --         DGCore.Functions.Notify("You are missing an advanced lockpick", "error")
                                        --     end
                                        -- end, "advancedlockpick")
                                    else
                                        DGCore.Functions.Notify("Security is still active..", "error")
                                    end
                                else
                                    DGCore.Functions.Notify("Not enough Police", "error")
                                end
                            end
                        end
                    else
                        if requiredItemsShowed2 then
                            requiredItems = {
                                "advancedlockpick"
                            }
                            requiredItemsShowed2 = false
                            TriggerEvent('inventory:client:requiredItems', requiredItems, false)
                        end
                    end
                end
            end

            if not inRange then
                if requiredItemsShowed2 then
                    requiredItems = {
                        "advancedlockpick"
                    }
                    requiredItemsShowed2 = false
                    TriggerEvent('inventory:client:requiredItems', requiredItems, false)
                end
                Citizen.Wait(2000)
            end
        end
    end
end)

function lockpickDone(success)
    local pos = GetEntityCoords(PlayerPedId())
    if math.random(1, 100) <= 80 and not IsWearingHandshoes() then
        TriggerServerEvent("evidence:server:CreateFingerDrop", pos)
    end
    if success then
        GrabItem(currentSpot)
    else
        if math.random(1, 100) <= 40 and IsWearingHandshoes() then
            TriggerServerEvent("evidence:server:CreateFingerDrop", pos)
            DGCore.Functions.Notify("You ripped your glove..")
        end
        if math.random(1, 100) <= 10 then
            TriggerServerEvent("DGCore:Server:RemoveItem", "advancedlockpick", 1)
        end
    end
end

function GrabItem(spot)
    local pos = GetEntityCoords(PlayerPedId())
    if requiredItemsShowed2 then
        requiredItemsShowed2 = false
        TriggerEvent('inventory:client:requiredItems', requiredItems, false)
    end
    DGCore.Functions.Progressbar("grab_ifruititem", "Disconnect Item", 10000, false, true, {
        disableMovement = true,
        disableCarMovement = true,
        disableMouse = false,
        disableCombat = true,
    }, {
        animDict = "anim@gangops@facility@servers@",
        anim = "hotwire",
        flags = 16,
    }, {}, {}, function() -- Done
        if not copsCalled then
            local s1, s2 = Citizen.InvokeNative(0x2EB41072B4C1E4C0, pos.x, pos.y, pos.z, Citizen.PointerValueInt(), Citizen.PointerValueInt())
            local street1 = GetStreetNameFromHashKey(s1)
            local street2 = GetStreetNameFromHashKey(s2)
            local streetLabel = street1
            if street2 ~= nil then 
                streetLabel = streetLabel .. " " .. street2
            end
            -- if Config.SmallBanks[closestBank]["alarm"] then
                TriggerServerEvent("qb-ifruitstore:server:callCops", streetLabel, pos)
                copsCalled = true
            -- end
        end


        StopAnimTask(PlayerPedId(), "anim@gangops@facility@servers@", "hotwire", 1.0)
        TriggerServerEvent('qb-ifruitstore:server:setSpotState', "isDone", true, spot)
        TriggerServerEvent('qb-ifruitstore:server:setSpotState', "isBusy", false, spot)
        TriggerServerEvent('qb-ifruitstore:server:itemReward', spot)
        TriggerServerEvent('qb-ifruitstore:server:PoliceAlertMessage', 'People try to steal items at the iFruit Store', pos, true)
    end, function() -- Cancel
        StopAnimTask(PlayerPedId(), "anim@gangops@facility@servers@", "hotwire", 1.0)
        TriggerServerEvent('qb-ifruitstore:server:setSpotState', "isBusy", false, spot)
        DGCore.Functions.Notify("Canceled..", "error")
    end)
end

RegisterNetEvent('SafeCracker:EndMinigame')
AddEventHandler('SafeCracker:EndMinigame', function(won)
    if usingSafe then
        if won then
            if not Config.Locations["safe"].isDone then
                SetNuiFocus(false, false)
                TriggerServerEvent("qb-ifruitstore:server:SafeReward")
                TriggerServerEvent("qb-ifruitstore:server:SetSafeStatus", "isBusy", false)
                TriggerServerEvent("qb-ifruitstore:server:SetSafeStatus", "isDone", false)
                takeAnim()
            end
        end
    end
end)

RegisterNetEvent('DGCore:Client:OnPlayerLoaded')
AddEventHandler('DGCore:Client:OnPlayerLoaded', function()
    isLoggedIn = true
    TriggerServerEvent("qb-ifruitstore:server:LoadLocationList")
end)

RegisterNetEvent('DGCore:Client:OnPlayerUnload')
AddEventHandler('DGCore:Client:OnPlayerUnload', function()
    isLoggedIn = false
end)

RegisterNetEvent('police:SetCopCount')
AddEventHandler('police:SetCopCount', function(amount)
    CurrentCops = amount
end)

RegisterNetEvent('qb-ifruitstore:client:LoadList')
AddEventHandler('qb-ifruitstore:client:LoadList', function(list)
    Config.Locations = list
end)

RegisterNetEvent('thermite:UseThermite')
AddEventHandler('thermite:UseThermite', function()
    local pos = GetEntityCoords(PlayerPedId())
    if #(pos - vector3(Config.Locations["thermite"].x, Config.Locations["thermite"].y,Config.Locations["thermite"].z)) < 1.0 then
        if CurrentCops >= 0 then
            local pos = GetEntityCoords(PlayerPedId())
            if math.random(1, 100) <= 80 and not IsWearingHandshoes() then
                TriggerServerEvent("evidence:server:CreateFingerDrop", pos)
            end
            if requiredItemsShowed then
                requiredItems = {
                    "thermite",
                }
                requiredItemsShowed = false
                TriggerEvent('inventory:client:requiredItems', requiredItems, false)
                TriggerServerEvent("qb-ifruitstore:server:SetThermiteStatus", "isBusy", true)
                SetNuiFocus(true, true)
                SendNUIMessage({
                    action = "openThermite",
                    amount = math.random(5, 6),
                })
            end
        else
            DGCore.Functions.Notify("Not enough police", "error")
        end
    end
end)

RegisterNetEvent('qb-ifruitstore:client:setSpotState')
AddEventHandler('qb-ifruitstore:client:setSpotState', function(stateType, state, spot)
    if stateType == "isBusy" then
        Config.Locations["takeables"][spot].isBusy = state
    elseif stateType == "isDone" then
        Config.Locations["takeables"][spot].isDone = state
    end
end)

RegisterNetEvent('qb-ifruitstore:client:SetSafeStatus')
AddEventHandler('qb-ifruitstore:client:SetSafeStatus', function(stateType, state)
    if stateType == "isBusy" then
        Config.Locations["safe"].isBusy = state
    elseif stateType == "isDone" then
        Config.Locations["safe"].isDone = state
    end
end)

RegisterNetEvent('qb-ifruitstore:client:SetThermiteStatus')
AddEventHandler('qb-ifruitstore:client:SetThermiteStatus', function(stateType, state)
    if stateType == "isBusy" then
        Config.Locations["thermite"].isBusy = state
    elseif stateType == "isDone" then
        Config.Locations["thermite"].isDone = state
    end
end)

RegisterNetEvent('qb-ifruitstore:client:PoliceAlertMessage')
AddEventHandler('qb-ifruitstore:client:PoliceAlertMessage', function(msg, coords, blip)
    if blip then
        PlaySound(-1, "Lose_1st", "GTAO_FM_Events_Soundset", 0, 0, 1)
        -- TODO: remove when dispatch is written
        TriggerEvent("chatMessage", "911-Report", "error", msg)
        local transG = 100
        local blip = AddBlipForRadius(coords.x, coords.y, coords.z, 100.0)
        SetBlipSprite(blip, 9)
        SetBlipColour(blip, 1)
        SetBlipAlpha(blip, transG)
        SetBlipAsShortRange(blip, false)
        BeginTextCommandSetBlipName('STRING')
        AddTextComponentString("911 - Suspicious situation in the iFruit Store")
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
    else
        if not robberyAlert then
            PlaySound(-1, "Lose_1st", "GTAO_FM_Events_Soundset", 0, 0, 1)
            -- TODO: remove when dispatch is written
            TriggerEvent("chatMessage", "911-Report", "error", msg)
            robberyAlert = true
        end
    end 
end)

RegisterNUICallback('thermiteclick', function()
    PlaySound(-1, "CLICK_BACK", "WEB_NAVIGATION_SOUNDS_PHONE", 0, 0, 1)
end)

RegisterNUICallback('thermitefailed', function()
    PlaySound(-1, "Place_Prop_Fail", "DLC_Dmod_Prop_Editor_Sounds", 0, 0, 1)
    TriggerServerEvent("qb-ifruitstore:server:SetThermiteStatus", "isBusy", false)
    TriggerServerEvent("DGCore:Server:RemoveItem", "thermite", 1)
    local coords = GetEntityCoords(PlayerPedId())
    local randTime = math.random(10000, 15000)
    CreateFire(coords, randTime)

    TriggerServerEvent('qb-ifruitstore:server:PoliceAlertMessage', 'People try to steal items at the iFruit Store', coords, true)
end)

RegisterNUICallback('thermitesuccess', function()
    DGCore.Functions.Notify("The fuses are broken", "success")
    TriggerServerEvent("DGCore:Server:RemoveItem", "thermite", 1)
    local pos = GetEntityCoords(PlayerPedId())
    if #(pos - vector3(Config.Locations["thermite"].x, Config.Locations["thermite"].y,Config.Locations["thermite"].z)) < 1.0 then
        TriggerServerEvent("qb-ifruitstore:server:SetThermiteStatus", "isDone", true)
        TriggerServerEvent("qb-ifruitstore:server:SetThermiteStatus", "isBusy", false)
    end
end)

RegisterNUICallback('closethermite', function()
    SetNuiFocus(false, false)
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

function takeAnim()
    local ped = PlayerPedId()
    while (not HasAnimDictLoaded("amb@prop_human_bum_bin@idle_b")) do
        RequestAnimDict("amb@prop_human_bum_bin@idle_b")
        Citizen.Wait(100)
    end
    TaskPlayAnim(ped, "amb@prop_human_bum_bin@idle_b", "idle_d", 8.0, 8.0, -1, 50, 0, false, false, false)
    Citizen.Wait(2500)
    TaskPlayAnim(ped, "amb@prop_human_bum_bin@idle_b", "exit", 8.0, 8.0, -1, 50, 0, false, false, false)
end

function CreateFire(coords, time)
    for i = 1, math.random(1, 7), 1 do
        TriggerServerEvent("thermite:StartServerFire", coords, 24, false)
    end
    Citizen.Wait(time)
    TriggerServerEvent("thermite:StopFires")
end

RegisterNetEvent('qb-ifruitstore:client:robberyCall')
AddEventHandler('qb-ifruitstore:client:robberyCall', function(streetLabel, coords)
    if PlayerJob.name == "police" then 
        local store = "iFruitStore"

            PlaySound(-1, "Lose_1st", "GTAO_FM_Events_Soundset", 0, 0, 1)
            TriggerEvent('qb-policealerts:client:AddPoliceAlert', {
                timeOut = 10000,
                alertTitle = "iFruitStore robbery attempt",
                coords = {
                    x = coords.x,
                    y = coords.y,
                    z = coords.z,
                },
                details = {
                    [1] = {
                        icon = '<i class="fas fa-university"></i>',
                        detail = bank,
                    },
                    [2] = {
                        icon = '<i class="fas fa-video"></i>',
                        detail = cameraId,
                    },
                    [3] = {
                        icon = '<i class="fas fa-globe-europe"></i>',
                        detail = streetLabel,
                    },
                },
                callSign = DGCore.Functions.GetPlayerData().metadata["callsign"],
            })
        
        local transG = 250
        local blip = AddBlipForCoord(coords.x, coords.y, coords.z)
        SetBlipSprite(blip, 487)
        SetBlipColour(blip, 4)
        SetBlipDisplay(blip, 4)
        SetBlipAlpha(blip, transG)
        SetBlipScale(blip, 1.2)
        SetBlipFlashes(blip, true)
        BeginTextCommandSetBlipName('STRING')
        AddTextComponentString("10-90: iFruitStore Robbery")
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
    end
end)