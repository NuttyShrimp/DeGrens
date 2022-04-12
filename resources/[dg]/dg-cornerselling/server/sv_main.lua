RegisterServerEvent("onResourceStart", function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end

    dropOldSales()
    local sales = fetchSellLocations() 

    generateHeatmap(sales)
end)

dropOldSales = function()
    exports.oxmysql:executeSync(
        [[
        DELETE FROM cornerselling_sales
        WHERE date < NOW() - INTERVAL :decaytime DAY
        ]], {
        ["decaytime"] = Config.SaleDecayTime,
    })
end

fetchSellLocations = function()
    local result = exports.oxmysql:executeSync(
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

getSellableItems = function(Player)
    local sellableItems = {}

    for k, _ in pairs(Config.SellableItems) do
        local itemData = Player.Functions.GetItemByName(k)
        if itemData then
            sellableItems[#sellableItems+1] = {
                name = itemData.name,
                amount = itemData.amount,
            }
        end
    end

    return sellableItems
end

DGCore.Functions.CreateCallback("dg-cornerselling:server:HasSellableItems", function(source, cb)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local hasSellableItems = next(getSellableItems(Player)) ~= nil
    cb(hasSellableItems)
end)

RegisterServerEvent("dg-cornerselling:server:SellDrugs", function(sellLocation)
    if not sellLocation then return end
    
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local sellableItems = getSellableItems(Player)
    local itemData = sellableItems[math.random(1, #sellableItems)]
    local amount = math.random(Config.SellAmount.min, Config.SellAmount.max)
    amount = amount > itemData.amount and itemData.amount or amount

    if Player.Functions.RemoveItem(itemData.name, amount) then
        TriggerClientEvent('inventory:client:ItemBox', src, itemData.name, "remove")
        TriggerClientEvent('DGCore:Notify', src, ("Je hebt %s %s verkocht"):format(amount, exports['dg-inventory']:GetItemData(itemData.name).label))

        local price = calculatePrice(itemData.name, amount, sellLocation)
        exports['dg-financials']:addCash(src, price, 'corner-sell')

        addToHeatmap(sellLocation)
        
        exports.oxmysql:execute(
            [[
            INSERT INTO `cornerselling_sales` (coords, date) 
            VALUES (:coords, NOW()) 
            ]], {
            ["coords"] = json.encode(sellLocation),
        })

        local rng = math.random(100)
        if rng < Config.CleanChance then
            exports['dg-blackmoney']:randomSellBlackMoney(src)
        end
    end
end)

calculatePrice = function(item, amount, coords)
    local itemPrices = Config.SellableItems[item]
    local itemPrice = math.random(itemPrices.min, itemPrices.max)
    local multiplier = getIntensityFromHeatmap(coords)
    print(multiplier)
    local cash = math.floor(itemPrice * amount * multiplier)
    return cash
end