DGX.Inventory.registerUseable("fitbit", function(src)
    TriggerClientEvent('qb-fitbit:use', src)
end)

RegisterServerEvent('qb-fitbit:server:setValue')
AddEventHandler('qb-fitbit:server:setValue', function(type, value)
    local src = source
    local ply = DGCore.Functions.GetPlayer(src)
    local fitbitData = {}

    if type == "thirst" then
        local currentMeta = ply.PlayerData.metadata["fitbit"]
        fitbitData = {
            thirst = value,
            food = currentMeta.food
        }
    elseif type == "food" then
        local currentMeta = ply.PlayerData.metadata["fitbit"]
        fitbitData = {
            thirst = currentMeta.thirst,
            food = value
        }
    end

    ply.Functions.SetMetaData('fitbit', fitbitData)
end)

DGCore.Functions.CreateCallback('qb-fitbit:server:HasFitbit', function(source, cb)
    local Ply = DGCore.Functions.GetPlayer(source)
    local Fitbit = Ply.Functions.GetItemByName("fitbit")

    if Fitbit ~= nil then
        cb(true)
    else
        cb(false)
    end
end)