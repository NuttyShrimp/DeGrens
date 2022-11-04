RegisterServerEvent("onResourceStart", function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    fetchPlants()
end)

RegisterServerEvent("dg-weed:server:PlacePlant", function(coords, gender)
    local removed = DGX.Inventory.removeItemFromPlayer(source, config.seeds[gender])
    if removed then
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
      DGX.Notifications.add(source, "Je hebt dit item niet", "error")
    end
end)

RegisterServerEvent("dg-weed:server:FeedPlant", function(index)
    local removed = DGX.Inventory.removeItemFromPlayer(source, "plant_fertilizer")
    if removed then
        activePlants[index].data.food = activePlants[index].data.food + math.random(config.food.amount.min, config.food.amount.max)
        if activePlants[index].data.food > 100 then activePlants[index].data.food = 100 end
        updatePlantData()
      DGX.Notifications.add(source, "Je hebt de plant gevoed", "success")
    else
      DGX.Notifications.add(source, "Je hebt dit item niet", "error")
    end
end)

RegisterServerEvent("dg-weed:server:CutPlant", function(index)
    if canCut(index) then
        local item = ""
        if activePlants[index].gender == "F" then
            item = "weed_bud"
        elseif activePlants[index].gender == "M" then
            local items = {}
            for k, v in pairs(config.seeds) do
                items[#items+1] = v
            end
            item = items[math.random(1, #items)]
        end
    
        DGX.Inventory.addItemToPlayer(source, item, 1)
        activePlants[index].data.cuttime = os.time()
    
        updatePlantData()
        DGX.Notifications.add(source, "Je hebt de plant geknipt", "success")
    
        Citizen.Wait(100)
        local chance = math.random(100)
        if chance <= config.cut.breakChance then
            removePlant(index)
          DGX.Notifications.add(source, "De plant is dood")
        end
    else
      DGX.Notifications.add(source, "Deze plant is nog niet volgroeid", "success")
    end
end)


RegisterServerEvent("dg-weed:server:DestroyPlant", function(index)
    removePlant(index)
end)