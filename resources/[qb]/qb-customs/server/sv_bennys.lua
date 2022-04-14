local DGCore = exports['dg-core']:GetCoreObject()

local chicken = vehicleBaseRepairCost

RegisterNetEvent('qb-customs:attemptPurchase', function(type, upgradeLevel)
    local source = source
    local Player = DGCore.Functions.GetPlayer(source)
		local bankAccId = exports['dg-financials']:getDefaultAccountId(source)
    local balance = nil
    if Player.PlayerData.job.name == "mechanic" then
        balance = exports['qb-bossmenu']:GetAccount(Player.PlayerData.job.name)
    else
        balance = exports['dg-financials']:getAccountBalance(bankAccId)
    end
    if type == "repair" then
        if balance >= chicken then
            if Player.PlayerData.job.name == "mechanic" then
                TriggerEvent('qb-bossmenu:server:removeAccountMoney', Player.PlayerData.job.name, chicken)
            else
								exports['dg-financials']:purchase(bankAccId, Player.PlayerData.citizenid, chicken, 'Vehicle repair at benny\'s', 5)
            end
            TriggerClientEvent('qb-customs:purchaseSuccessful', source)
        else
            TriggerClientEvent('qb-customs:purchaseFailed', source)
        end
    elseif type == "performance" then
        if balance >= vehicleCustomisationPrices[type].prices[upgradeLevel] then
            TriggerClientEvent('qb-customs:purchaseSuccessful', source)
            if Player.PlayerData.job.name == "mechanic" then
                TriggerEvent('qb-bossmenu:server:removeAccountMoney', Player.PlayerData.job.name,
                    vehicleCustomisationPrices[type].prices[upgradeLevel])
            else
	            exports['dg-financials']:purchase(bankAccId, Player.PlayerData.citizenid, vehicleCustomisationPrices[type].prices[upgradeLevel], 'Vehicle upgrade at benny\'s', 5)
            end
        else
            TriggerClientEvent('qb-customs:purchaseFailed', source)
        end
    else
        if balance >= vehicleCustomisationPrices[type].price then
            TriggerClientEvent('qb-customs:purchaseSuccessful', source)
            if Player.PlayerData.job.name == "mechanic" then
                TriggerEvent('qb-bossmenu:server:removeAccountMoney', Player.PlayerData.job.name,
                    vehicleCustomisationPrices[type].price)
            else
	            exports['dg-financials']:purchase(bankAccId, Player.PlayerData.citizenid, vehicleCustomisationPrices[type].price, 'Vehicle upgrade at benny\'s', 5)
            end
        else
            TriggerClientEvent('qb-customs:purchaseFailed', source)
        end
    end
end)

RegisterNetEvent('qb-customs:updateRepairCost', function(cost)
    chicken = cost
end)

RegisterNetEvent("updateVehicle", function(myCar)
    local src = source
    if IsVehicleOwned(myCar.plate) then
        exports['dg-sql']:query('UPDATE player_vehicles SET mods = ? WHERE plate = ?', {json.encode(myCar), myCar.plate})
    end
end)

function IsVehicleOwned(plate)
    local retval = false
    local result = exports['dg-sync']:scalar('SELECT plate FROM player_vehicles WHERE plate = ?', {plate})
    if result then
        retval = true
    end
    return retval
end