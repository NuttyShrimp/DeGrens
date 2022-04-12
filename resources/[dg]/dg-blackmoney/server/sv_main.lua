randomSellBlackMoney = function(source)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)

    local itemToSell = Config.Items[math.random(1, #Config.Items)]
    local itemData = Player.Functions.GetItemByName(itemToSell)
    if not itemData then return end

    local amount = math.random(Config.RandomSellAmount.min, Config.RandomSellAmount.max)
    amount = amount > itemData.amount and itemData.amount or amount

    if Player.Functions.RemoveItem(itemData.name, amount) then
        TriggerClientEvent('inventory:client:ItemBox', src, itemData.name, "remove")

        local itemPrices = Config.Worth[itemData.name]
        local price = math.random(itemPrices.min, itemPrices.max) * amount
        exports['dg-financials']:addCash(src, price, 'randomsell-blackmoney')
    end
end
exports("randomSellBlackMoney", randomSellBlackMoney)