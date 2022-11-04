RegisterServerEvent("onResourceStart", function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end

    dropOldSales()
    local sales = fetchSellLocations() 

    generateHeatmap(sales)
end)

dropOldSales = function()
    exports['dg-sql']:query(
        [[
        DELETE FROM cornerselling_sales
        WHERE date < NOW() - INTERVAL :decaytime DAY
        ]], {
        ["decaytime"] = Config.SaleDecayTime,
    })
end

fetchSellLocations = function()
    local result = exports['dg-sql']:query(
        [[
        SELECT coords
        FROM cornerselling_sales
        ]]  
    )
    local coordsList = {}
    if result and next(result) then
        for k, v in ipairs(result) do
            if v.coords then
                local obj = json.decode(v.coords)
                coordsList[#coordsList+1] = vector3(obj.x, obj.y, obj.z)
            end
        end
    end 

    return coordsList
end

getSellableItems = function(src)
    local sellableItems = {}

    for k, _ in pairs(Config.SellableItems) do
        local amount = DGX.Inventory.getAmountPlayerHas(src, k)
        if amount ~= 0 then
            sellableItems[#sellableItems+1] = {
                name = k,
                amount = amount,
            }
        end
    end

    return sellableItems
end

DGCore.Functions.CreateCallback("dg-cornerselling:server:HasSellableItems", function(source, cb)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local hasSellableItems = next(getSellableItems(src)) ~= nil
    cb(hasSellableItems)
end)

RegisterServerEvent("dg-cornerselling:server:SellDrugs", function(sellLocation)
    if not sellLocation then return end
    
    local src = source
    local sellableItems = getSellableItems(src)
    local itemData = sellableItems[math.random(1, #sellableItems)]

    if DGX.Inventory.removeItemFromPlayer(src, itemData.name) then
      DGX.Notifications.add(src, ("Je hebt %s verkocht"):format(DGX.Inventory.getItemData(itemData.name).label))

        local price = calculatePrice(itemData.name, sellLocation)
        DGX.Financials.addCash(src, price, 'corner-sell')
        DGX.Util.Log('cornerselling:sale', {
            item = itemData.name,
            price = price,
            location = sellLocation,
        }, string.format("%s has made sale of %s via cornerselling", GetPlayerName(src), DGX.Inventory.getItemData(itemData.name).label), src)

        addToHeatmap(sellLocation)
        
        exports['dg-sql']:query(
            [[
            INSERT INTO `cornerselling_sales` (coords, date) 
            VALUES (:coords, NOW()) 
            ]], {
            ["coords"] = json.encode(sellLocation),
        })

        local rng = math.random(100)
        if rng < Config.CleanChance then
            exports['dg-misc']:randomSellBlackMoney(src)
        end
    end
end)

calculatePrice = function(item, coords)
    local itemPrices = Config.SellableItems[item]
    local itemPrice = math.random(itemPrices.min, itemPrices.max)
    local multiplier = getIntensityFromHeatmap(coords)
    local cash = math.floor(itemPrice * multiplier)
    return cash
end