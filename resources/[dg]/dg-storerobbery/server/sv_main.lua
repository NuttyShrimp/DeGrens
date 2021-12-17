local DGCore = exports['dg-core']:GetCoreObject()
local openedRegisters = {}
local openedSafes = {}

DGCore.Functions.CreateCallback("dg-storerobbery:server:GetConfig", function(source, cb) 
    local callback = {}
    callback.openedRegisters = openedRegisters
    callback.openedSafes = openedSafes
    cb(callback)
end)

RegisterNetEvent("dg-storerobbery:server:OpenRegister", function(register)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local amount = math.random(Config.Registers.RewardAmount - 1, Config.Registers.RewardAmount + 1)
    Player.Functions.AddItem(Config.Registers.Reward, amount)
    TriggerClientEvent('inventory:client:ItemBox', src, exports["dg-inventory"]:GetItemData()[Config.Registers.Reward], "add")

    openedRegisters[#openedRegisters + 1] = register
    TriggerClientEvent("dg-storerobbery:client:UpdateOpenedRegister", -1, openedRegisters)

    Citizen.SetTimeout(Config.Registers.Timeout, function()
        -- we always remove the first one because the timeout is same for every registr so the one at index 2 will always be removed later than the one at index 1
        table.remove(openedRegisters, 1)
        TriggerClientEvent("dg-storerobbery:client:UpdateOpenedRegister", -1, openedRegisters)
    end)
end)

RegisterNetEvent("dg-storerobbery:server:HackSafe", function(safe)
    openedSafes[#openedSafes + 1] = safe
    TriggerClientEvent("dg-storerobbery:client:UpdateOpenedSafe", -1, openedSafes)

    Citizen.SetTimeout(Config.Safe.Timeout, function()
        -- we always remove the first one because the timeout is same for every safe so the one at index 2 will always be removed later than the one at index 1
        table.remove(openedSafes, 1)
        TriggerClientEvent("dg-storerobbery:client:UpdateOpenedSafe", -1, openedSafes)
    end)
end)

RegisterNetEvent("dg-storerobbery:server:LootSafe", function()
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local amount = math.random(Config.Safe.RewardAmount - 1, Config.Safe.RewardAmount + 1)
    Player.Functions.AddItem(Config.Safe.Reward, amount)
    TriggerClientEvent('inventory:client:ItemBox', src, exports["dg-inventory"]:GetItemData()[Config.Safe.Reward], "add")
end)

RegisterNetEvent("dg-storerobbery:server:CallCops", function(store, streetLabel, coords)
    local cops = {}
    for _, playerId in pairs(DGCore.Functions.GetPlayers()) do
        local Player = DGCore.Functions.GetPlayer(playerId)
        if Player then 
            if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
                cops[#cops + 1] = playerId
            end
        end
    end

    local alertData = {
        title = "Poging Winkeloverval",
        coords = {x = coords.x, y = coords.y, z = coords.z},
        description = "Poging winkeloverbij bij"..streetLabel.." (CAMERA ID: "..Config.Stores[store].cam..")"
    }

    for _, id in pairs(cops) do
        TriggerClientEvent("qb-phone:client:addPoliceAlert", id, alertData)
        TriggerClientEvent("dg-storerobbery:client:PoliceAlert", id, store, streetLabel, coords)
    end
end)
