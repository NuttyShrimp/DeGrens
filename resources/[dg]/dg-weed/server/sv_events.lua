RegisterServerEvent("onResourceStart", function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    fetchPlants()
end)

RegisterServerEvent("dg-weed:server:PlacePlant", function(coords, gender)
    local Player = DGCore.Functions.GetPlayer(source)
    if Player.Functions.RemoveItem(Config.Seeds[gender], 1) then
        TriggerClientEvent("inventory:client:ItemBox", source, Config.Seeds[gender], "remove")

        local result = exports['dg-sql']:query(
            [[
                INSERT INTO weedplants (coords, gender, growtime, cuttime)
                VALUES (:coords, :gender, :growtime, :cuttime)
                RETURNING id, stage, coords, gender, food, growtime, cuttime
            ]], {
            ["coords"] = json.encode(coords),
            ["gender"] = gender,
            ["growtime"] = os.time(),
            ["cuttime"] = os.time(),
        })
        
        if result[1] and next(result[1]) then
            activePlants[tonumber(result[1].id)] = {
                object = nil,
                coords = vector3(json.decode(result[1].coords).x, json.decode(result[1].coords).y, json.decode(result[1].coords).z),
                gender = result[1].gender,
                data = {
                    stage = tonumber(result[1].stage),
                    food = tonumber(result[1].food),
                    growtime = tonumber(result[1].growtime),
                    cuttime = tonumber(result[1].cuttime)
                }
            }

            TriggerClientEvent("dg-weed:client:AddPlant", -1, tonumber(result[1].id), activePlants[tonumber(result[1].id)])
        end
    else
        TriggerClientEvent("DGCore:Notify", source, "Je hebt dit item niet", "error")
    end
end)

RegisterServerEvent("dg-weed:server:FeedPlant", function(index)
    local Player = DGCore.Functions.GetPlayer(source)
    if Player.Functions.RemoveItem(Config.Food.Item, 1) then
        TriggerClientEvent("inventory:client:ItemBox", source, Config.Food.Item, "remove")
        activePlants[index].data.food = activePlants[index].data.food + math.random(Config.Food.Amount.min, Config.Food.Amount.max)
        if activePlants[index].data.food > 100 then activePlants[index].data.food = 100 end
        updatePlantData()
        TriggerClientEvent("DGCore:Notify", source, "Je hebt de plant gevoed", "success")
    else
        TriggerClientEvent("DGCore:Notify", source, "Je hebt dit item niet", "error")
    end
end)

RegisterServerEvent("dg-weed:server:CutPlant", function(index)
    if canCut(index) then
        local Player = DGCore.Functions.GetPlayer(source)
        local item = ""
        if activePlants[index].gender == "F" then
            item = Config.Cut.Item
        elseif activePlants[index].gender == "M" then
            local items = {}
            for k, v in pairs(Config.Seeds) do
                items[#items+1] = v
            end
            item = items[math.random(1, #items)]
        end
    
        Player.Functions.AddItem(item, 1)
        TriggerClientEvent("inventory:client:ItemBox", source, item, "add")
        activePlants[index].data.cuttime = os.time()
    
        updatePlantData()
        TriggerClientEvent("DGCore:Notify", source, "Je hebt de plant geknipt", "success")
    
        Citizen.Wait(100)
        local chance = math.random(100)
        if chance <= Config.Cut.BreakChance then
            removePlant(index)
            TriggerClientEvent("DGCore:Notify", source, "De plant is dood")
        end
    else
        TriggerClientEvent("DGCore:Notify", source, "Deze plant is nog niet volgroeid", "success")
    end
end)


RegisterServerEvent("dg-weed:server:DestroyPlant", function(index)
    removePlant(index)
end)