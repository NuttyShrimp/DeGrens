fetchPlants = function()
    local result = exports['dg-sql']:query("SELECT * FROM weedplants")
    if not result or not next(result) then return end 

    for k, v in pairs(result) do
        activePlants[tonumber(v.id)] = {
            object = nil,
            coords = vector3(json.decode(v.coords).x, json.decode(v.coords).y, json.decode(v.coords).z),
            gender = v.gender,
            data = {
                stage = tonumber(v.stage),
                food = tonumber(v.food),
                growtime = tonumber(v.growtime),
                cuttime = tonumber(v.cuttime)
            }
        }
    end
end

updatePlantData = function()
    local plantData = {}
    for index, plant in pairs(activePlants) do
        plantData[index] = plant.data
    end

    TriggerClientEvent("dg-weed:client:UpdatePlantData", -1, plantData)
    savePlants()
end

savePlants = function()
    for k, v in pairs(activePlants) do
        exports['dg-sql']:query(
            [[
                UPDATE weedplants
                SET stage = :stage, food = :food, growtime = :growtime, cuttime = :cuttime
                WHERE id = :id
            ]], {
            ["stage"] = v.data.stage,
            ["food"] = v.data.food,
            ["growtime"] = v.data.growtime,
            ["cuttime"] = v.data.cuttime,
            ["id"] = k,
        })
    end
end

removePlant = function(index)
    activePlants[index] = nil
    exports['dg-sql']:query(
        [[
            DELETE FROM weedplants
            WHERE id = :id
        ]], {
        ["id"] = index
    })
    TriggerClientEvent("dg-weed:client:RemovePlant", -1, index)
end

canCut = function(index)
    return os.time() >= activePlants[index].data.cuttime + Config.Cut.Time
end
