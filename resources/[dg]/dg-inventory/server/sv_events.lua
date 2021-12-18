DGCore = exports['dg-core']:GetCoreObject()

RegisterServerEvent("inventory:server:CombineItem")
AddEventHandler("inventory:server:CombineItem", function(item, fromItem, toItem)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)

	if fromItem == nil  then return end
	if toItem == nil then return end

	-- Check that they have the items
	local fromItem = Player.Functions.GetItemByName(fromItem)
	local toItem = Player.Functions.GetItemByName(toItem)

	if fromItem == nil  then return end
	if toItem == nil then return end

	local recipe = GetItemData()[toItem.name].combinable

	if recipe and recipe.reward ~= item then return end
	if not RecipeContains(recipe, fromItem) then return end

	TriggerClientEvent("inventory:client:ItemBox", src, GetItemData()[item], "add")
	Player.Functions.AddItem(item, 1)
	Player.Functions.RemoveItem(fromItem.name, 1)
	Player.Functions.RemoveItem(toItem.name, 1)
end)

RegisterServerEvent("inventory:server:SetIsOpenState")
AddEventHandler("inventory:server:SetIsOpenState", function(IsOpen, type, id)
	if not IsOpen then
		if type == "stash" then
			Inventories["stash"][id].isOpen = false
		elseif type == "trunk" then
			Inventories["trunk"][id].isOpen = false
		elseif type == "glovebox" then
			Inventories["glovebox"][id].isOpen = false
        elseif type == "dumpster" then
			Inventories["dumpster"][id].isOpen = false
		end
	end
end)

RegisterServerEvent("inventory:server:OpenInventory")
AddEventHandler("inventory:server:OpenInventory", function(invType, id, other)
    local src = source

	if not Player(src).state.inv_busy then
        local Player = DGCore.Functions.GetPlayer(src)

        Player.Functions.SetInventory(UpdateQualityOnTime(Player.PlayerData.items), false)

		if invType and id then
			local secondInv = {}

			if invType == "shop" then
				secondInv.name = "itemshop-"..id
				secondInv.label = other.label
				secondInv.maxweight = 1000000
				secondInv.inventory = SetupShopItems(other.items)
				ShopItems[id] = {}
				ShopItems[id].items = other.items
				secondInv.slots = #other.items
			elseif invType == "otherplayer" then
				local OtherPlayer = DGCore.Functions.GetPlayer(tonumber(id))
				if OtherPlayer then
					secondInv.name = invType.."-"..id
					secondInv.label = "Player"
					secondInv.maxweight = DGCore.Config.Player.MaxWeight
					secondInv.inventory = OtherPlayer.PlayerData.items
                    secondInv.slots = DGCore.Config.Player.MaxInvSlots
					Citizen.Wait(250)
				end
            elseif invType == "give" then
                secondInv.name = invType.."-"..id
                secondInv.label = "Give Item"
                secondInv.maxweight = 100000
                secondInv.inventory = {}
                secondInv.slots = 1
                Inventories[invType][id] = {}
                Inventories[invType][id].items = {}
                Inventories[invType][id].isOpen = source
                Inventories[invType][id].label = secondInv.label
			elseif invType == "drop" then
				if Inventories[invType][id] and not Inventories[invType][id].isOpen then
                    Inventories[invType][id].items = UpdateQualityOnTime(Inventories[invType][id].items)
					secondInv.name = invType.."-"..id
					secondInv.label = "Dropped"
					secondInv.maxweight = 100000
					secondInv.inventory = Inventories[invType][id].items
					secondInv.slots = 15
					Inventories[invType][id].isOpen = src
					Inventories[invType][id].label = secondInv.label
				else
					secondInv.name = "none-inv"
					secondInv.label = "None"
					secondInv.maxweight = 100000
					secondInv.inventory = {}
					secondInv.slots = 0
				end
            else
				if Inventories[invType][id] then
					if Inventories[invType][id].isOpen then
						local Target = DGCore.Functions.GetPlayer(Inventories[invType][id].isOpen)
						if Target then
							TriggerClientEvent("inventory:client:CheckOpenState", Inventories[invType][id].isOpen, invType, id, Inventories[invType][id].label)
						else
							Inventories[invType][id].isOpen = false
						end
					end
				end

				local maxweight = invType == "stash" and 2000000 or 10000
				local slots = invType == "stash" and 100 or 5
				if other then
					maxweight = other.maxweight and other.maxweight or 10000
					slots = other.slots and other.slots or 5
				end

				secondInv.name = invType.."-"..id
				secondInv.label = invType:gsub("^%l", string.upper)
				secondInv.maxweight = maxweight
				secondInv.inventory = {}
				secondInv.slots = slots

				if Inventories[invType][id] and Inventories[invType][id].isOpen then
					secondInv.name = "none-inv"
					secondInv.label = "None"
					secondInv.maxweight = 0
					secondInv.inventory = {}
					secondInv.slots = 0
				else
					if id then
                        local items
                        if invType ~= "dumpster" then
                            items = GetFrom(invType, id)
                            items = UpdateQualityOnTime(items)
                        end

						if (invType == "stash" or IsVehicleOwned(id)) and next(items) then
							secondInv.inventory = items
							Inventories[invType][id] = {}
							Inventories[invType][id].items = items
							Inventories[invType][id].isOpen = src
							Inventories[invType][id].label = secondInv.label
						elseif Inventories[invType][id] and not Inventories[invType][id].isOpen then
                            Inventories[invType][id].items = UpdateQualityOnTime(Inventories[invType][id].items)
							secondInv.inventory = Inventories[invType][id].items
							Inventories[invType][id].isOpen = src
							Inventories[invType][id].label = secondInv.label
						else
							Inventories[invType][id] = {}
							Inventories[invType][id].items = {}
							Inventories[invType][id].isOpen = src
							Inventories[invType][id].label = secondInv.label
						end
					end
				end
			end
			TriggerClientEvent("inventory:client:OpenInventory", src, {}, Player.PlayerData.items, secondInv)
		else
			TriggerClientEvent("inventory:client:OpenInventory", src, {}, Player.PlayerData.items)
		end
	else
		TriggerClientEvent("DGCore:Notify", src, "Not Accessible", "error")
	end
end)

RegisterServerEvent("inventory:server:SaveInventory")
AddEventHandler("inventory:server:SaveInventory", function(invType, id)
	if invType == "trunk" or invType == "glovebox" then
		if IsVehicleOwned(id) then
			SaveItems(invType, id, Inventories[invType][id].items)
		else
			Inventories[invType][id].isOpen = false
		end
	elseif invType == "stash" then
        SaveItems(invType, id, Inventories[invType][id].items)
	elseif invType == "drop" then
		if Inventories[invType][id] then
			Inventories[invType][id].isOpen = false
			if Inventories[invType][id].items == nil or next(Inventories[invType][id].items) == nil then
				Inventories[invType][id] = nil
				TriggerClientEvent("inventory:client:RemoveDropItem", -1, id)
                Drops[id] = nil
			end
		end
    elseif invType == "dumpster" then
        if Inventories[invType][id] then
			Inventories[invType][id].isOpen = false
			if Inventories[invType][id].items == nil or next(Inventories[invType][id].items) == nil then
				Inventories[invType][id] = nil
                Dumpsters[id] = nil
			end
		end
    elseif invType == "give" then
        TriggerClientEvent("inventory:client:ClosedGiveInventory", -1, Inventories[invType])
	end
end)

RegisterServerEvent("inventory:server:UseItemSlot")
AddEventHandler("inventory:server:UseItemSlot", function(slot)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	local itemData = Player.Functions.GetItemBySlot(slot)

	if itemData then
		local itemInfo = GetItemData()[itemData.name]
		if itemInfo.type == "weapon" then
			if itemData.quality and itemData.quality == 0 then
				TriggerClientEvent("weapons:client:UseWeapon", src, itemData, false)
			else
				TriggerClientEvent("weapons:client:UseWeapon", src, itemData, true)
			end
			TriggerClientEvent("inventory:client:ItemBox", src, itemInfo, "use")
		elseif itemInfo.useable then
			TriggerClientEvent("DGCore:Client:UseItem", src, itemData)
			TriggerClientEvent("inventory:client:ItemBox", src, itemInfo, "use")
		end
	end
end)

RegisterServerEvent("inventory:server:UseItem")
AddEventHandler("inventory:server:UseItem", function(inventory, item)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	if inventory == "player" then
		local itemData = Player.Functions.GetItemBySlot(item.slot)
		if itemData then
			TriggerClientEvent("DGCore:Client:UseItem", src, itemData)
		end
	end
end)

RegisterServerEvent("inventory:server:SetInventoryData")
AddEventHandler("inventory:server:SetInventoryData", function(fromInventory, toInventory, fromSlot, toSlot, fromAmount, toAmount)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	local fromSlot = tonumber(fromSlot)
	local toSlot = tonumber(toSlot)

	if fromInventory == "player" then
        if DGCore.Shared.SplitStr(toInventory, "-")[1] == "itemshop" then
            return -- cant give items to shop dumbfuck
        elseif tonumber(toInventory) == 0 then -- 0 is no other inventory
            CreateNewDrop(src, fromSlot, toSlot, fromAmount)
        else
            MoveItemFromPlayer(src, Player, toInventory, fromSlot, toSlot, fromAmount, toAmount)
        end
	elseif DGCore.Shared.SplitStr(fromInventory, "-")[1] == "itemshop" then
		local shopType = DGCore.Shared.SplitStr(fromInventory, "-")[2]
		local itemData = ShopItems[shopType].items[fromSlot]
		local itemInfo = GetItemData()[itemData.name:lower()]
		local bankBalance = Player.PlayerData.money["bank"]
		local price = tonumber(itemData.price * fromAmount)

        local enoughMoney = false
        if Player.Functions.RemoveMoney("cash", price, "shop-bought-item") then
            enoughMoney = true
        elseif bankBalance >= price then
            Player.Functions.RemoveMoney("bank", price, "shop-bought-item")
            enoughMoney = true
        end
        
        if enoughMoney then
            Player.Functions.AddItem(itemData.name, fromAmount, toSlot, itemData.info, itemData.quality, itemData.createtime)
            TriggerClientEvent("qb-shops:client:UpdateShop", src, DGCore.Shared.SplitStr(shopType, "_")[2], itemData, fromAmount)
            TriggerClientEvent("DGCore:Notify", src, itemInfo["label"] .. " bought!", "success")
            TriggerEvent("qb-log:server:CreateLog", "shops", "Shop item bought", "green", "**"..GetPlayerName(src) .. "** bought a " .. itemInfo["label"] .. " for $"..price)
        else
            TriggerClientEvent("DGCore:Notify", src, "You don\'t have enough money..", "error")
        end
	else
        MoveItemToPlayer(src, Player, fromInventory, toInventory, fromSlot, toSlot, fromAmount, toAmount)
	end
end)

RegisterServerEvent("inventory:server:SaveDumpster")
AddEventHandler("inventory:server:SaveDumpster", function(dumpster)
    Dumpsters[dumpster.id] = dumpster
end)

RegisterServerEvent("inventory:server:ReceiveItem")
AddEventHandler("inventory:server:ReceiveItem", function(playerId, item)
    if playerId and item then
        local Player = DGCore.Functions.GetPlayer(playerId)
        Player.Functions.AddItem(item.name, item.amount, false, item.info, item.quality)
    end
end)