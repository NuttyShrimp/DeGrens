local DGCore = exports['dg-core']:GetCoreObject()
local openedRegisters = {}

DGCore.Functions.CreateCallback("dg-storerobbery:server:GetConfig", function(source, cb) 
    local callback = {}
    callback.openedRegisters = openedRegisters

    local safes = {}
    for k, v in pairs(Config.Stores) do
        safes[k] = v.safe.state
    end
    callback.safes = safes
    cb(callback)
end)

RegisterNetEvent("dg-storerobbery:server:OpenRegister", function(register)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local amount = math.random(Config.Registers.RewardAmount - 1, Config.Registers.RewardAmount + 1)
    Player.Functions.AddItem(Config.Registers.Reward, amount)
    TriggerClientEvent('inventory:client:ItemBox', src, Config.Registers.Reward, "add")

    openedRegisters[#openedRegisters + 1] = register
    TriggerClientEvent("dg-storerobbery:client:UpdateOpenedRegisters", -1, openedRegisters)

    Citizen.SetTimeout(Config.Registers.Timeout, function()
        -- we always remove the first one because the timeout is same for every registr so the one at index 2 will always be removed later than the one at index 1
        table.remove(openedRegisters, 1)
        TriggerClientEvent("dg-storerobbery:client:UpdateOpenedRegisters", -1, openedRegisters)
    end)
end)

RegisterNetEvent("dg-storerobbery:server:HackSafe", function(store)
    Config.Stores[store].safe.state = "decoding" 
    TriggerClientEvent("dg-storerobbery:client:UpdateSafe", -1, store, "decoding")

    Citizen.SetTimeout(Config.Safe.LootDelay, function()
        if Config.Stores[store].safe.state == "decoding" then
            Config.Stores[store].safe.state = "opened" 
            TriggerClientEvent("dg-storerobbery:client:UpdateSafe", -1, store, "opened")
        end
    end)
end)

RegisterNetEvent("dg-storerobbery:server:LootSafe", function(store)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local amount = math.random(Config.Safe.RewardAmount - 1, Config.Safe.RewardAmount + 1)
    Player.Functions.AddItem(Config.Safe.Reward, amount)
    TriggerClientEvent('inventory:client:ItemBox', src, Config.Safe.Reward, "add")

    local rng = math.random(1, 100)
    if rng >= Config.Safe.SpecialItemChance then
        Player.Functions.AddItem(Config.Safe.SpecialItem, 1)
        TriggerClientEvent('inventory:client:ItemBox', src, Config.Safe.SpecialItem, "add")
    end

    Config.Stores[store].safe.state = "looted"
    TriggerClientEvent("dg-storerobbery:client:UpdateSafe", -1, store, "looted")

    Citizen.SetTimeout(Config.Safe.Timeout, function()
        if Config.Stores[store].safe.state == "looted" then
            Config.Stores[store].safe.state = "closed" 
            TriggerClientEvent("dg-storerobbery:client:UpdateSafe", -1, store, "closed")
        end
    end)
end)

RegisterNetEvent("dg-storerobbery:server:LeftSafe", function(store)
    Config.Stores[store].safe.state = "closed"
    TriggerClientEvent("dg-storerobbery:client:UpdateSafe", -1, store, "closed")
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
