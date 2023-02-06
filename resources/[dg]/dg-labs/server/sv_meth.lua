local activeMethLabData = {}

DGX.Inventory.registerUseable("meth_brick", function(src, item)
    local Player = DGCore.Functions.GetPlayer(src)
    local hasEmptyBags = DGX.Inventory.doesPlayerHaveItems(src, 'empty_bags')
    if not hasEmptyBags then
        DGX.RPC.execute("dg-ui:client:addNotification", src, "Waar ga je dit insteken?", "error")
        return
    end
    
    -- TODO: Update to metadata
    if os.time() >= item.createtime + (getConfig().meth.dryTime * 60 * 60) then
        local amount = math.floor((3 * item.info.purity^2) / 100) -- calculate amount
        print(("Amount: %s, Purity: %s"):format(amount, item.info.purity))

        DGX.Inventory.removeItemByNameFromPlayer(src, 'empty_bags')
        DGX.Inventory.removeItemByNameFromPlayer(src, item.name)
        
        DGX.Inventory.addItemToPlayer(src, 'meth_bag', amount)
    else
        DGX.RPC.execute('dg-ui:client:addNotification', src, "Dit is nog niet droog", "error")
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
    local recipe = states[labId].recipe
    local settings = states[labId].settings
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
    for _, status in pairs(states[labId].status) do
        if status < getConfig().meth.fillAmount then
            retval = false
            break
        end
    end
    return retval
end

-- Callbacks
DGCore.Functions.CreateCallback("dg-labs:server:meth:GetStartState", function(source, cb, labId)
    if not labId or getLabTypeFromId(labId) ~= "meth" then return end
    cb(states[labId].started)
end)

DGCore.Functions.CreateCallback("dg-labs:server:meth:GetSettings", function(source, cb, labId, settingsId)
    if not labId or getLabTypeFromId(labId) ~= "meth" then return end
    cb(states[labId].settings[settingsId])
end)

DGCore.Functions.CreateCallback("dg-labs:server:meth:GetStatus", function(source, cb, labId, statusId)
    if not labId or getLabTypeFromId(labId) ~= "meth" then return end
    local filled = states[labId].status[statusId] >= getConfig().meth.fillAmount
    cb(filled)
end)

DGCore.Functions.CreateCallback("dg-labs:server:meth:CanCollect", function(source, cb, labId)
    if not labId or getLabTypeFromId(labId) ~= "meth" then return end

    if not states[labId].started then
        DGX.RPC.execute("dg-ui:client:addNotification", source, "Er staat nog niks aan...", "error")
        cb(false)
        return
    end

    if not getAllStationsFilled(labId) then
        DGX.RPC.execute("dg-ui:client:addNotification", source, "Nog niet alles is gevuld...", "error")
        cb(false)
        return
    end

    cb(true)
end)

-- Events
RegisterServerEvent("dg-labs:server:meth:SetStartState", function(labId)
    if not labId or getLabTypeFromId(labId) ~= "meth" then return end

    if states[labId].started then 
        DGX.RPC.execute("dg-ui:client:addNotification", source, "Dit staat al aan...", "error")
        return
    end

    states[labId].started = true
    local seed = DGCore.Functions.GetPlayer(source).PlayerData.citizenid
    states[labId].recipe = generateRecipe(seed)
end)

RegisterServerEvent("dg-labs:server:meth:SetSettings", function(labId, settingsId, data)
    if not labId or getLabTypeFromId(labId) ~= "meth" then return end

    states[labId].settings[settingsId] = data
end)

RegisterServerEvent("dg-labs:server:meth:IncreaseStatus", function(labId, statusId)
    if not labId or getLabTypeFromId(labId) ~= "meth" then return end
    states[labId].status[statusId] = states[labId].status[statusId] + 1
end)

RegisterServerEvent("dg-labs:server:meth:Collect", function(labId)
    if not labId or getLabTypeFromId(labId) ~= "meth" then return end -- TODO: Possible log/flag on triggering this event without providing correct labId to prevent injector

    if not states[labId].started or not getAllStationsFilled(labId) then return end

    local Player = DGCore.Functions.GetPlayer(source)
    local quality = getRecipeQuality(labId)
    DGX.Inventory.addItemToPlayer(source, 'meth_brick', 1, {purity = quality})

    local resetTime = getConfig().meth.resetTime * 60 * 1000
    Citizen.SetTimeout(resetTime, function()
        states[labId] = json.decode(json.encode(getConfig().types["meth"].defaultState))
    end)
end)