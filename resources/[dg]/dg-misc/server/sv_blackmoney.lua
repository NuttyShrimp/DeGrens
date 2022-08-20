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

    local itemToSell = blackMoneyConfig.Items[math.random(1, #blackMoneyConfig.Items)]
    local hasItem = DGX.Inventory.doesPlayerHaveItems(src, itemToSell)
    if not hasItem then return end

    DGX.Inventory.removeItemFromPlayer(source, itemToSell)
    local itemPrices = blackMoneyConfig.Worth[itemData.name]
    local price = math.random(itemPrices.min, itemPrices.max)
    exports['dg-financials']:addCash(src, price, 'randomsell-blackmoney')
    DGX.Util.Log('blackmoney:sellRandom', {
        item = itemData.name,
        price = price,
    }, string.format("%s has made sale of %s", GetPlayerName(src), DGX.Inventory.getItemData(itemData.name).label), src)
end
exports("randomSellBlackMoney", randomSellBlackMoney)
