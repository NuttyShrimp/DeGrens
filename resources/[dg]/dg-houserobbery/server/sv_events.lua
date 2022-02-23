local DGCore = exports['dg-core']:GetCoreObject()

DGCore.Functions.CreateCallback('dg-houserobbery:server:GetAllHouseData', function(source, cb)
    local data = {}

    for k, v in pairs(Config.Houses) do
        data[k] = v.data
    end

    cb(data)
end)

AddEventHandler('playerJoining', function()
    Player(source).state.houseRobSignedIn = false -- init the state when playerjoins
end)

RegisterNetEvent('dg-houserobbery:server:UpdateDoor', function(houseId, state)
    Config.Houses[houseId].data.unlocked = state
    TriggerClientEvent('dg-houserobbery:client:UpdateHouseData', -1, houseId, Config.Houses[houseId].data)
end)

RegisterNetEvent('dg-houserobbery:server:SearchLocation', function(houseId, locationId)
    Config.Houses[houseId].data.searched[locationId] = true
    TriggerClientEvent('dg-houserobbery:client:UpdateHouseData', -1, houseId, Config.Houses[houseId].data)

    Citizen.SetTimeout(Config.Search.Timeout, function()
        Config.Houses[houseId].data.searched[locationId] = nil
        TriggerClientEvent('dg-houserobbery:client:UpdateHouseData', -1, houseId, Config.Houses[houseId].data)
    end)
end)

RegisterNetEvent('dg-houserobbery:server:GiveLoot', function()
    local Player = DGCore.Functions.GetPlayer(source)
    local item = Config.Loot[math.random(1, #Config.Loot)]
    Player.Functions.AddItem(item, 1)
    TriggerClientEvent('inventory:client:ItemBox', source, item, "add")

    local rng = math.random(1, 100)
    if rng <= Config.Search.SpecialItemChance then
        Player.Functions.AddItem(Config.Search.SpecialItem, 1)
        TriggerClientEvent('inventory:client:ItemBox', source, Config.Search.SpecialItem, "add")
    end
end)

RegisterNetEvent('dg-houserobbery:server:TakeableSpawned', function(houseId)
    Config.Houses[houseId].data.takeableSpawned = true
    TriggerClientEvent('dg-houserobbery:client:UpdateHouseData', -1, houseId, Config.Houses[houseId].data)
end)

RegisterNetEvent('dg-houserobbery:server:TakeableTaken', function(houseId, takeable)
    local Player = DGCore.Functions.GetPlayer(source)
    Player.Functions.AddItem(takeable.item, 1)
    TriggerClientEvent('inventory:client:ItemBox', source, takeable.item, "add")

    Citizen.SetTimeout(Config.Search.Timeout, function()
        Config.Houses[houseId].data.takeableSpawned = false
        TriggerClientEvent('dg-houserobbery:client:UpdateHouseData', -1, houseId, Config.Houses[houseId].data)
    end)
end)

RegisterNetEvent('dg-houserobbery:server:SellItem', function(itemData)
    local amount = Config.Sell.Price[itemData.name] * itemData.amount
    exports['dg-financials']:addCash(source, amount, 'houserobbery-sell')
end)

RegisterNetEvent("dg-houserobbery:server:CallCops", function(streetLabel, coords)
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
        title = "Poging Huisinbraak",
        coords = {x = coords.x, y = coords.y, z = coords.z},
        description = "Poging huisinbraak bij"..streetLabel
    }

    for _, id in pairs(cops) do
        TriggerClientEvent("qb-phone:client:addPoliceAlert", id, alertData)
        TriggerClientEvent("dg-houserobbery:client:PoliceAlert", id, streetLabel, coords)
    end
end)


