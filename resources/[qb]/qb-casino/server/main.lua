local CHIP_PRICE = 1

RegisterServerEvent("qb-casino:server:sell")
AddEventHandler("qb-casino:server:sell", function()
	local src = source
	local amount = 0
	local Player = DGCore.Functions.GetPlayer(src)
	local xItem = Player.Functions.GetItemByName("casinochips")
	if xItem ~= nil then
		for k, item in pairs(Player.PlayerData.items) do
			if item ~= nil then
				itemName = item.name
				if itemName == "casinochips" then
					amount = amount + item.amount
					Player.Functions.RemoveItem(name, item.amount, "casinochips")
				end
			end
		end

		local price = amount * CHIP_PRICE

		exports['dg-financials']:addCash(src, price, ("Sold %d casino chips for %d"):format(amount, price))
		TriggerClientEvent('DGCore:Notify', src, "You sold your chips for $" .. price)
		TriggerEvent("qb-log:server:CreateLog", "casino", "Chips", "blue", "**" .. GetPlayerName(src) .. "** got $" .. price .. " for selling the Chips")
	else
		TriggerClientEvent('DGCore:Notify', src, "You have no chips..")
	end
end)

function SetExports()
	exports["qb-blackjack"]:SetGetChipsCallback(function(source)
		local Player = DGCore.Functions.GetPlayer(source)
		local Chips = Player.Functions.GetItemByName("casinochips")

		if Chips ~= nil then
			Chips = Chips
		end

		return TriggerClientEvent('DGCore:Notify', src, "You have no chips..")
	end)

	exports["qb-blackjack"]:SetTakeChipsCallback(function(source, amount)
		local Player = DGCore.Functions.GetPlayer(source)

		if Player ~= nil then
			Player.Functions.RemoveItem("casinochips", amount)
			TriggerClientEvent('inventory:client:ItemBox', source, 'casinochips', "remove")
			TriggerEvent("qb-log:server:CreateLog", "casino", "Chips", "yellow", "**" .. GetPlayerName(source) .. "** put $" .. amount .. " in table")
		end
	end)

	exports["qb-blackjack"]:SetGiveChipsCallback(function(source, amount)
		local Player = DGCore.Functions.GetPlayer(source)

		if Player ~= nil then
			Player.Functions.AddItem("casinochips", amount)
			TriggerClientEvent('inventory:client:ItemBox', source, 'casinochips', "add")
			TriggerEvent("qb-log:server:CreateLog", "casino", "Chips", "red", "**" .. GetPlayerName(source) .. "** got $" .. amount .. " from table table and he won the double")
		end
	end)
end

AddEventHandler("onResourceStart", function(resourceName)
	if ("qb-blackjack" == resourceName) then
		Citizen.Wait(1000)
		SetExports()
	end
end)

SetExports()
