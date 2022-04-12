local cacheIds = {}
local currentCops = 0

local pedsSoldTo = {}
local cornersellingEnabled = false
local hasTargetBuyer = false

AddEventHandler("onResourceStart", function(resoureName)
    if resourceName ~= GetCurrentResourceName() then return end
    currentCops = DGCore.Functions.TriggerCallback("police:GetCops")
end)

RegisterNetEvent('onResourceStop', function(resourceName)
	if GetCurrentResourceName() ~= resourceName then return end
    exports["dg-peek"]:removeEntityEntry(cacheIds)
end)

RegisterNetEvent('police:SetCopCount', function(amount)
	currentCops = amount
end)

RegisterNetEvent("dg-cornerselling:client:ToggleSelling", function()
    if not cornersellingEnabled then
        local hasSellableItems = DGCore.Functions.TriggerCallback("dg-cornerselling:server:HasSellableItems")
        if not hasSellableItems then
            DGCore.Functions.Notify("Je hebt niks op zak", "error")
            return
        end
    
        if currentCops < Config.RequiredCops then
            DGCore.Functions.Notify("Burgers hebben momenteel geen interesse", "error")
            return
        end

        DGCore.Functions.Notify("Gestart met verkopen", "success")
        cornersellingEnabled = true
        buyerTargettingLoop()
    else
        DGCore.Functions.Notify("Gestopt met verkopen")
        cornersellingEnabled = false
        hasTargetBuyer = false
    end
end)

buyerTargettingLoop = function() 
    Citizen.CreateThread(function()
        while cornersellingEnabled do
            Citizen.Wait(5000)

            local ped = PlayerPedId()

            local pedsToIgnore = {}
            for _, player in ipairs(GetActivePlayers()) do
                pedsToIgnore[#pedsToIgnore+1] = GetPlayerPed(player)
            end

            for _, ped in pairs(pedsSoldTo) do
                pedsToIgnore[#pedsToIgnore+1] = ped
            end

            local targetPed, targetDistance = DGCore.Functions.GetClosestPed(GetEntityCoords(ped), pedsToIgnore)
            if targetDistance <= 10.0 and not IsPedInAnyVehicle(targetPed) and not IsPedDeadOrDying(targetPed, 1) then
                hasTargetBuyer = true

                TaskStartScenarioInPlace(targetPed, "WORLD_HUMAN_STAND_IMPATIENT_UPRIGHT", 0, false)

                local targetId = NetworkGetNetworkIdFromEntity(targetPed)
                cacheIds = exports['dg-peek']:addEntityEntry(targetId, {
                    options = {
                        {
                            icon = 'fas fa-handshake',
                            label = 'Verkoop',
                            action = function(_, entity)
                                exports["dg-cornerselling"]:sellToTarget(entity)
                            end,
                        },
                    },
                    distance = 1.0
                })

                while hasTargetBuyer do
                    if #(GetEntityCoords(ped) - GetEntityCoords(targetPed)) >= 20 or IsPedDeadOrDying(targetPed, 1) then -- stop selling to ped if out of range or dead
                        hasTargetBuyer = false
                    end
                    Citizen.Wait(50)
                end

                SetPedKeepTask(targetPed, false)
                ClearPedTasks(targetPed)
                TaskWanderStandard(targetPed, 10.0, 10)
                SetPedAsNoLongerNeeded(targetPed)
                exports["dg-peek"]:removeEntityEntry(cacheIds)

                Citizen.Wait(10000) 
            end
        end
    end)
end

exports('sellToTarget', function(targetPed)
    local ped = PlayerPedId()

    loadAnimDict("mp_safehouselost@")
    TaskPlayAnim(ped, "mp_safehouselost@", "package_dropoff", 8.0, 1.0, -1, 16, 0, 0, 0, 0)
    TaskPlayAnim(targetPed, "mp_safehouselost@", "package_dropoff", 8.0, 1.0, -1, 16, 0, 0, 0, 0)
    Citizen.Wait(5000)

    TriggerServerEvent("dg-cornerselling:server:SellDrugs", GetEntityCoords(ped))

    SetPedKeepTask(targetPed, false)
    ClearPedTasks(targetPed)
    TaskWanderStandard(targetPed, 10.0, 10)
    SetPedAsNoLongerNeeded(targetPed)
    pedsSoldTo[#pedsSoldTo+1] = targetPed

    hasTargetBuyer = false
end)

loadAnimDict = function(dict)
	RequestAnimDict(dict)
	while not HasAnimDictLoaded(dict) do
		Citizen.Wait(5)
	end
end
