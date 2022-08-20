local DGCore = exports['dg-core']:GetCoreObject()

local PaymentTax = 15
local Bail = {}

RegisterServerEvent('qb-tow:server:DoBail')
AddEventHandler('qb-tow:server:DoBail', function(bool, vehInfo)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)

		-- TODO: Replace with a % of the payment based on the vehicle damage
    --if bool then
    --    if Player.PlayerData.money.bank >= Config.BailPrice then
    --        Bail[Player.PlayerData.citizenid] = Config.BailPrice
    --        Player.Functions.RemoveMoney('bank', Config.BailPrice, "tow-paid-bail")
    --        TriggerClientEvent('DGCore:Notify', src, 'You Have Paid The Deposit Of $'..Config.BailPrice..' Paid', 'success')
    --        TriggerClientEvent('qb-tow:client:SpawnVehicle', src, vehInfo)
    --    else
    --        TriggerClientEvent('DGCore:Notify', src, 'You Do Not Have Enough Cash, The Deposit Is $'..Config.BailPrice..'', 'error')
    --    end
    --else
    --    if Bail[Player.PlayerData.citizenid] ~= nil then
    --        Player.Functions.AddMoney('bank', Bail[Player.PlayerData.citizenid], "tow-bail-paid")
    --        Bail[Player.PlayerData.citizenid] = nil
    --        TriggerClientEvent('DGCore:Notify', src, 'You Got Back $'..Config.BailPrice..' From The Deposit', 'success')
    --    end
    --end
end)

RegisterNetEvent('qb-tow:server:nano')
AddEventHandler('qb-tow:server:nano', function()
    local xPlayer = DGCore.Functions.GetPlayer(tonumber(source))

	-- xPlayer.Functions.AddItem("cryptostick", 1, false)
end)

RegisterNetEvent('qb-tow:server:11101110')
AddEventHandler('qb-tow:server:11101110', function(drops)
    local src = source 
    local Player = DGCore.Functions.GetPlayer(src)
    local drops = tonumber(drops)
    local bonus = 0
    local DropPrice = math.random(150, 170)
    if drops > 5 then 
        bonus = math.ceil((DropPrice / 10) * 5)
    elseif drops > 10 then
        bonus = math.ceil((DropPrice / 10) * 7)
    elseif drops > 15 then
        bonus = math.ceil((DropPrice / 10) * 10)
    elseif drops > 20 then
        bonus = math.ceil((DropPrice / 10) * 12)
    end
    local price = (DropPrice * drops) + bonus
    local taxAmount = math.ceil((price / 100) * PaymentTax)
    local payment = price - taxAmount

    Player.Functions.AddJobReputation(1)
		-- TODO: Add exports to add to paycheck
		exports['dg-chat']:addMessage(source, {
		  prefix = 'JOB: ',
		  message = "You Received Your Salary From: $"..payment..", Gross: $"..price.." (From What $"..bonus.." Bonus) In $"..taxAmount.." Tax ("..PaymentTax.."%)",
      color = 'warning',
		})
end)

DGCore.Commands.Add("npc", "Toggle Npc Job", {}, false, function(source, args)
	TriggerClientEvent("jobs:client:ToggleNpc", source)
end)

DGCore.Commands.Add("tow", "Place A Car On The Back Of Your Flatbed", {}, false, function(source, args)
    local Player = DGCore.Functions.GetPlayer(source)
    if Player.PlayerData.job.name == "tow"  or Player.PlayerData.job.name == "mechanic" then
        TriggerClientEvent("qb-tow:client:TowVehicle", source)
    end
end)
