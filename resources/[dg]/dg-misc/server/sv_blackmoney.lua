local blackMoneyConfig = nil

Citizen.CreateThread(function()
  while not DGX.Config.areConfigsReady() do
    Citizen.Wait(100)
  end
  blackMoneyConfig = DGX.Config.getModuleConfig('blackmoney')
end)

RegisterNetEvent('dg-config:moduleLoaded', function(module, config)
  if module == 'blackmoney' then
    blackMoneyConfig = config
  end
end)

randomSellBlackMoney = function(source)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)

    local itemToSell = blackMoneyConfig.Items[math.random(1, #blackMoneyConfig.Items)]
    local itemData = Player.Functions.GetItemByName(itemToSell)
    if not itemData then return end

    local amount = math.random(blackMoneyConfig.RandomSellAmount.min, blackMoneyConfig.RandomSellAmount.max)
    amount = amount > itemData.amount and itemData.amount or amount

    if Player.Functions.RemoveItem(itemData.name, amount) then
        TriggerClientEvent('inventory:client:ItemBox', src, itemData.name, "remove")

        local itemPrices = blackMoneyConfig.Worth[itemData.name]
        local price = math.random(itemPrices.min, itemPrices.max) * amount
        exports['dg-financials']:addCash(src, price, 'randomsell-blackmoney')
    end
end
exports("randomSellBlackMoney", randomSellBlackMoney)
