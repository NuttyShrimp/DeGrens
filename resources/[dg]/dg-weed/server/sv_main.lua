activePlants = {}

for gender, itemName in pairs(Config.Seeds) do
    DGCore.Functions.CreateUseableItem(itemName, function(source, item)
        local Player = DGCore.Functions.GetPlayer(source)
        if not Player.Functions.GetItemByName(item.name) then return end
        TriggerClientEvent("dg-weed:client:Plant", source, gender)
    end)
end

DGCore.Functions.CreateUseableItem(Config.Cut.Item, function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
    if not Player.Functions.GetItemByName(item.name) then return end
    
    local bagInfo = Player.Functions.GetItemByName("empty_bag")
    if not bagInfo then
        TriggerClientEvent("DGCore:Notify", source, "Waar ga je dit insteken?", "error")
        return
    end

    if os.time() >= item.createtime + Config.Dry.Time then
        local amount = math.random(Config.Dry.Amount.min, Config.Dry.Amount.max)
        if amount > bagInfo.amount then
            amount = bagInfo.amount
        end

        Player.Functions.RemoveItem("empty_bag", amount)
        TriggerClientEvent("inventory:client:ItemBox", source, "empty_bag", "remove")
        Player.Functions.RemoveItem(item.name, 1)
        TriggerClientEvent("inventory:client:ItemBox", source, item.name, "remove")

        Player.Functions.AddItem(Config.Dry.Item, amount)
        TriggerClientEvent("inventory:client:ItemBox", source, Config.Dry.Item, "add")
    else
        TriggerClientEvent("DGCore:Notify", source, "Dit is nog niet droog", "error")
    end
end)

DGCore.Functions.CreateCallback("dg-weed:server:GetPlants", function(source, cb)
    cb(activePlants)
end)

-- growth cycle
Citizen.CreateThread(function()
    while true do
        for index, plant in pairs(activePlants) do
            local currentTime = os.time()
            if plant.data.stage < #Config.Stages and currentTime >= plant.data.growtime + Config.GrowTime then -- if not endstage and enough time has passed
                activePlants[index].data.stage = plant.data.stage + 1
                activePlants[index].data.growtime = currentTime
            end
        end

        updatePlantData()
        Citizen.Wait(1000 * 60 * 10) -- check every 10 min
    end
end)

-- food cycle
Citizen.CreateThread(function()
    while true do 
        for index, plant in pairs(activePlants) do
            activePlants[index].data.food = plant.data.food - 1

            if activePlants[index].data.food <= 0 then
                removePlant(index)
            end
        end

        updatePlantData()
        Citizen.Wait(Config.Food.DecayTime)
    end
end)

DGCore.Functions.CreateCallback("dg-weed:server:CanCut", function(source, cb, index)
    cb(canCut(index))
end)