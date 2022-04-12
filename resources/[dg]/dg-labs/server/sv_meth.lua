DGCore.Functions.CreateUseableItem("meth_brick", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
    if not Player.Functions.GetItemByName(item.name) then return end
    
    local bagInfo = Player.Functions.GetItemByName("empty_bag")
    if not bagInfo then
        TriggerClientEvent("dg-ui:client:addNotification", source, "Waar ga je dit insteken?", "error")
        return
    end
    
    if os.time() >= item.createtime + Config.Meth.DryTime then
        local amount = math.floor((3 * item.info.purity^2) / 100) -- calculate amount
        print(("Amount: %s, Purity: %s"):format(amount, item.info.purity))

        Player.Functions.RemoveItem("empty_bag", amount)
        TriggerClientEvent("inventory:client:ItemBox", source, "empty_bag", "remove")
        Player.Functions.RemoveItem(item.name, 1)
        TriggerClientEvent("inventory:client:ItemBox", source, item.name, "remove")

        Player.Functions.AddItem("meth_bag", amount)
        TriggerClientEvent("inventory:client:ItemBox", source, "meth_bag", "add")
    else
        TriggerClientEvent("dg-ui:client:addNotification", source, "Dit is nog niet droog", "error")
    end
end)

-- Functions
local map = function(x, orgMin, orgMax, finMin, finMax)
    return ((x-orgMin)*(finMax-finMin))/((orgMax-orgMin)+finMin)
end

local generateRecipe = function(seed)
    local recipe = {}

    math.randomseed(seed)

    for i = 1, 5 do 
        recipe[i] = {}
        recipe[i].power  = math.random(100)
        recipe[i].amount = math.random(100)
    end

    return recipe
end

local getRecipeQuality = function(labId)
    local recipe = Config.Labs[labId].data.recipe
    local settings = Config.Labs[labId].data.settings
    local quality = 100

    for i = 1, 5 do
        for k, v in pairs(recipe[i]) do
            if v >= settings[i][k][1] and v <= settings[i][k][2] then
                local size = map(settings[i][k][2] - settings[i][k][1], 10, 100, 0, 100)
                local decrease = math.ceil(size / 10)
                quality = quality - decrease
            else
                quality = quality - 10
            end
        end
    end

    return quality
end

local getAllStationsFilled = function(labId)
    local retval = true
    for _, status in pairs(Config.Labs[labId].data.status) do
        if status < Config.Meth.FillAmount then
            retval = false
            break
        end
    end
    return retval
end

-- Callbacks
DGCore.Functions.CreateCallback("dg-labs:server:meth:GetStartState", function(source, cb, labId)
    if not labId or getLabTypeFromId(labId) ~= "meth" then return end
    cb(Config.Labs[labId].data.started)
end)

DGCore.Functions.CreateCallback("dg-labs:server:meth:GetSettings", function(source, cb, labId, settingsId)
    if not labId or getLabTypeFromId(labId) ~= "meth" then return end
    cb(Config.Labs[labId].data.settings[settingsId])
end)

DGCore.Functions.CreateCallback("dg-labs:server:meth:GetStatus", function(source, cb, labId, statusId)
    if not labId or getLabTypeFromId(labId) ~= "meth" then return end
    cb(Config.Labs[labId].data.status[statusId])
end)

DGCore.Functions.CreateCallback("dg-labs:server:meth:CanCollect", function(source, cb, labId)
    if not labId or getLabTypeFromId(labId) ~= "meth" then return end

    if not Config.Labs[labId].data.started then
        TriggerClientEvent("dg-ui:client:addNotification", source, "Er staat nog niks aan...", "error")
        cb(false)
        return
    end

    if not getAllStationsFilled(labId) then
        TriggerClientEvent("dg-ui:client:addNotification", source, "Nog niet alles is gevuld...", "error")
        cb(false)
        return
    end

    cb(true)
end)

-- Events
RegisterServerEvent("dg-labs:server:meth:SetStartState", function(labId)
    if not labId or getLabTypeFromId(labId) ~= "meth" then return end

    if Config.Labs[labId].data.started then 
        TriggerClientEvent("dg-ui:client:addNotification", source, "Dit staat al aan...", "error")
        return
    end

    Config.Labs[labId].data.started = true
    local seed = DGCore.Functions.GetPlayer(source).PlayerData.citizenid
    Config.Labs[labId].data.recipe = generateRecipe(seed)
    print(Config.Labs[labId].data.recipe[1].power, Config.Labs[labId].data.recipe[1].amount)
end)

RegisterServerEvent("dg-labs:server:meth:SetSettings", function(labId, settingsId, data)
    if not labId or getLabTypeFromId(labId) ~= "meth" then return end

    Config.Labs[labId].data.settings[settingsId] = data
end)

RegisterServerEvent("dg-labs:server:meth:IncreaseStatus", function(labId, statusId)
    if not labId or getLabTypeFromId(labId) ~= "meth" then return end

    if Config.Labs[labId].data.status[statusId] >= Config.Meth.FillAmount then 
        TriggerClientEvent("dg-ui:client:addNotification", source, "Dit zit al vol...", "error")
        return
    end

    Config.Labs[labId].data.status[statusId] = Config.Labs[labId].data.status[statusId] + 1
end)

RegisterServerEvent("dg-labs:server:meth:Collect", function(labId)
    if not labId or getLabTypeFromId(labId) ~= "meth" then return end -- TODO: Possible log/flag on triggering this event without providing correct labId to prevent injector

    if not Config.Labs[labId].data.started or not getAllStationsFilled(labId) then return end

    local Player = DGCore.Functions.GetPlayer(source)
    local quality = getRecipeQuality(labId)
    local info = {purity = quality}
    Player.Functions.AddItem("meth_brick", 1, nil, info)

    Citizen.SetTimeout(Config.Meth.Timeout, function()
        Config.Labs[labId].data = json.decode(json.encode(Config.Types["meth"].defaultData))
    end)
end)