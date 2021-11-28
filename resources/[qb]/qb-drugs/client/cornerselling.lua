local cornerselling = false
local hasTarget = false
local busySelling = false
local CurrentCops = 0
local PlayerJob = {}
local onDuty = false
local startLocation = nil
local currentPed = nil
local lastPed = {}
local stealingPed = nil
local stealData = {}
local availableDrugs = {}

local policeMessage = {
    "Suspicious situation",
    "Possible drug dealing",
}

RegisterNetEvent('qb-drugs:client:cornerselling', function(data)
    DGCore.Functions.TriggerCallback('qb-drugs:server:cornerselling:getAvailableDrugs', function(result)
        if CurrentCops >= Config.MinimumDrugSalePolice then
            if result ~= nil then
                availableDrugs = result
                if not cornerselling then
                    cornerselling = true
                    LocalPlayer.state:set("inv_busy", true, true)
                    DGCore.Functions.Notify('You started selling drugs')
                    startLocation = GetEntityCoords(PlayerPedId())
                else
                    cornerselling = false
                    LocalPlayer.state:set("inv_busy", false, true)
                    DGCore.Functions.Notify('You stopped selling drugs')
                end
            else
                DGCore.Functions.Notify('You aren\'t carrying any drugs with you..', 'error')
                LocalPlayer.state:set("inv_busy", false, true)
            end
        else
            DGCore.Functions.Notify("There Are Not Enough Police On Duty (".. Config.MinimumDrugSalePolice .." Required)", "error")
        end
    end)
end)

RegisterNetEvent('DGCore:Client:OnPlayerLoaded', function()
    PlayerJob = DGCore.Functions.GetPlayerData().job
    onDuty = true
end)

RegisterNetEvent('DGCore:Client:SetDuty', function(duty)
    onDuty = duty
end)

RegisterNetEvent('DGCore:Client:OnJobUpdate', function(JobInfo)
    PlayerJob = JobInfo
    onDuty = true
end)

RegisterNetEvent('police:SetCopCount', function(amount)
    CurrentCops = amount
end)

RegisterNetEvent('qb-drugs:client:refreshAvailableDrugs', function(items)
    availableDrugs = items
    if #availableDrugs <= 0 then
        DGCore.Functions.Notify('No more drugs left to sell!', 'error')
        cornerselling = false
        LocalPlayer.state:set("inv_busy", false, true)
    end
end)

local function DrawText3D(x, y, z, text)
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

local function loadAnimDict(dict)
    RequestAnimDict(dict)

    while not HasAnimDictLoaded(dict) do
        Wait(0)
    end
end

local function toFarAway()
    DGCore.Functions.Notify('Moved Too Far!', 'error')
    LocalPlayer.state:set("inv_busy", false, true)
    cornerselling = false
    hasTarget = false
    busySelling = false
    startLocation = nil
    currentPed = nil
    availableDrugs = {}
    Wait(5000)
end

local function callPolice(coords)
    local title = policeMessage[math.random(1, #policeMessage)]
    local pCoords = GetEntityCoords(PlayerPedId())
    local s1, s2 = GetStreetNameAtCoord(pCoords.x, pCoords.y, pCoords.z)
    local street1 = GetStreetNameFromHashKey(s1)
    local street2 = GetStreetNameFromHashKey(s2)
    local streetLabel = street1
    if street2 ~= nil then streetLabel = street1..' '..street2 end
    TriggerServerEvent('police:server:PoliceAlertMessage', title, streetLabel, coords)
    hasTarget = false
    Wait(5000)
end

local function SellToPed(ped)
    hasTarget = true
    for i = 1, #lastPed, 1 do
        if lastPed[i] == ped then
            hasTarget = false
            return
        end
    end

    local succesChance = math.random(1, 20)

    local scamChance = math.random(1, 5)

    local getRobbed = math.random(1, 20)

    if succesChance <= 7 then
        hasTarget = false
        return
    elseif succesChance >= 19 then
        callPolice(GetEntityCoords(ped))
        return
    end

    local drugType = math.random(1, #availableDrugs)
    local bagAmount = math.random(1, availableDrugs[drugType].amount)

    if bagAmount > 15 then
        bagAmount = math.random(9, 15)
    end
    currentOfferDrug = availableDrugs[drugType]

    local ddata = Config.DrugsPrice[currentOfferDrug.item]
    local randomPrice = math.random(ddata.min, ddata.max) * bagAmount
    if scamChance == 5 then
       randomPrice = math.random(3, 10) * bagAmount
    end

    SetEntityAsNoLongerNeeded(ped)
    ClearPedTasks(ped)

    local coords = GetEntityCoords(PlayerPedId(), true)
    local pedCoords = GetEntityCoords(ped)
    local pedDist = #(coords - pedCoords)

    if getRobbed == 18 or getRobbed == 9 then
        TaskGoStraightToCoord(ped, coords, 15.0, -1, 0.0, 0.0)
    else
        TaskGoStraightToCoord(ped, coords, 1.2, -1, 0.0, 0.0)
    end

    while pedDist > 1.5 do
        coords = GetEntityCoords(PlayerPedId(), true)
        pedCoords = GetEntityCoords(ped)    
        if getRobbed == 18 or getRobbed == 9 then
            TaskGoStraightToCoord(ped, coords, 15.0, -1, 0.0, 0.0)
        else
            TaskGoStraightToCoord(ped, coords, 1.2, -1, 0.0, 0.0)
        end
        TaskGoStraightToCoord(ped, coords, 1.2, -1, 0.0, 0.0)
        pedDist = #(coords - pedCoords)

        Wait(100)
    end

    TaskLookAtEntity(ped, PlayerPedId(), 5500.0, 2048, 3)
    TaskTurnPedToFaceEntity(ped, PlayerPedId(), 5500)
    TaskStartScenarioInPlace(ped, "WORLD_HUMAN_STAND_IMPATIENT_UPRIGHT", 0, false)
    currentPed = ped

    if hasTarget then
        while pedDist < 1.5 do
            coords = GetEntityCoords(PlayerPedId(), true)
            pedCoords = GetEntityCoords(ped)
            pedDist = #(coords - pedCoords)
            if getRobbed == 18 or getRobbed == 9 then
                TriggerServerEvent('qb-drugs:server:robCornerDrugs', availableDrugs[drugType].item, bagAmount)
                DGCore.Functions.Notify('You have been robbed and lost '..bagAmount..' bags(\'s) '..availableDrugs[drugType].label, 'error')
                stealingPed = ped
                stealData = {
                    item = availableDrugs[drugType].item,
                    amount = bagAmount,
                }
                hasTarget = false
                local rand = (math.random(6,9) / 100) + 0.3
                local rand2 = (math.random(6,9) / 100) + 0.3
                if math.random(10) > 5 then
                    rand = 0.0 - rand
                end
                if math.random(10) > 5 then
                    rand2 = 0.0 - rand2
                end
                local moveto = GetEntityCoords(PlayerPedId())
                local movetoCoords = {x = moveto.x + math.random(100, 500), y = moveto.y + math.random(100, 500), z = moveto.z, }
                ClearPedTasksImmediately(ped)
                TaskGoStraightToCoord(ped, movetoCoords.x, movetoCoords.y, movetoCoords.z, 15.0, -1, 0.0, 0.0)
                lastPed[#lastPed+1] = ped
                break
            else
                if pedDist < 1.5 and cornerselling then
                    DrawText3D(pedCoords.x, pedCoords.y, pedCoords.z, '~g~E~w~ '..bagAmount..'x '..currentOfferDrug.label..' for $'..randomPrice..'? / ~g~G~w~ Decline offer')
                    if IsControlJustPressed(0, 38) then
                        TriggerServerEvent('qb-drugs:server:sellCornerDrugs', availableDrugs[drugType].item, bagAmount, randomPrice)
                        hasTarget = false

                        loadAnimDict("gestures@f@standing@casual")
                        TaskPlayAnim(PlayerPedId(), "gestures@f@standing@casual", "gesture_point", 3.0, 3.0, -1, 49, 0, 0, 0, 0)
                        Wait(650)
                        ClearPedTasks(PlayerPedId())

                        SetPedKeepTask(ped, false)
                        SetEntityAsNoLongerNeeded(ped)
                        ClearPedTasksImmediately(ped)
                        lastPed[#lastPed+1] = ped
                        break
                    end

                    if IsControlJustPressed(0, 47) then
                        DGCore.Functions.Notify('Offer canceled!', 'error')
                        hasTarget = false

                        SetPedKeepTask(ped, false)
                        SetEntityAsNoLongerNeeded(ped)
                        ClearPedTasksImmediately(ped)
                        lastPed[#lastPed+1] = ped
                        break
                    end
                else
                    hasTarget = false
                    pedDist = 5
                    SetPedKeepTask(ped, false)
                    SetEntityAsNoLongerNeeded(ped)
                    ClearPedTasksImmediately(ped)
                    lastPed[#lastPed+1] = ped
                    cornerselling = false
                    currentPed = nil
                end
            end
            Wait(3)
        end
        Wait(math.random(4000, 7000))
    end
end

CreateThread(function()
    while true do
        sleep = 1000
        if stealingPed ~= nil and stealData ~= nil then
            sleep = 0
            if IsEntityDead(stealingPed) then
                local ped = PlayerPedId()
                local pos = GetEntityCoords(ped)
                local pedpos = GetEntityCoords(stealingPed)
                if #(pos - pedpos) < 1.5 then
                    DrawText3D(pedpos.x, pedpos.y, pedpos.z, "[E] Pick up")
                    if IsControlJustReleased(0, 38) then
                        RequestAnimDict("pickup_object")
                        while not HasAnimDictLoaded("pickup_object") do
                            Wait(7)
                        end
                        TaskPlayAnim(ped, "pickup_object" ,"pickup_low" ,8.0, -8.0, -1, 1, 0, false, false, false )
                        Wait(2000)
                        ClearPedTasks(ped)
                        TriggerServerEvent("DGCore:Server:AddItem", stealData.item, stealData.amount)
                        TriggerEvent('inventory:client:ItemBox', exports["dg-inventory"]:GetItemData()[stealData.item], "add")
                        stealingPed = nil
                        stealData = {}
                    end
                end
            end
        end
        Wait(sleep)
    end
end)

CreateThread(function()
    while true do
        sleep = 1000
        if cornerselling then
            sleep = 0
            local player = PlayerPedId()
            local coords = GetEntityCoords(player)
            if not hasTarget then
                local PlayerPeds = {}
                if next(PlayerPeds) == nil then
                    for _, player in ipairs(GetActivePlayers()) do
                        local ped = GetPlayerPed(player)
                        PlayerPeds[#PlayerPeds+1] = ped
                    end
                end
                local closestPed, closestDistance = DGCore.Functions.GetClosestPed(coords, PlayerPeds)
                if closestDistance < 15.0 and closestPed ~= 0 and not IsPedInAnyVehicle(closestPed) then
                    SellToPed(closestPed)
                end
            end
            local startDist = #(startLocation - coords)
            if startDist > 10 then
                toFarAway()
            end
        end
        Wait(sleep)
    end
end)