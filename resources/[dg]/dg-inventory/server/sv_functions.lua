exports("GetItemData", function(item)
    return ItemData[item]
end)

function RecipeContains(recipe, fromItem)
	for _, v in pairs(recipe.accept) do
		if v == fromItem.name then
			return true
		end
	end

	return false
end

function SaveItems(invType, id, items)
    if Inventories[invType][id].label ~= invType.."-None" then
        if items then
            exports['dg-sql']:query(
                [[
                DELETE FROM inventoryitems
                WHERE inventorytype = :inventorytype AND inventoryid = :inventoryid
                ]], {
                ["inventorytype"] = invType,
                ["inventoryid"] = id,
            })  

            for _, item in pairs(items) do
                exports['dg-sql']:query(
                    [[
                    INSERT INTO inventoryitems (inventorytype, inventoryid, slot, name, info, amount, quality, createtime) 
                    VALUES (:inventorytype, :inventoryid, :slot, :name, :info, :amount, :quality, :createtime) 
                    ]], {
                    ["inventorytype"] = invType,
                    ["inventoryid"] = id,
                    ["slot"] = item.slot,
                    ["name"] = item.name,
                    ["info"] = json.encode(item.info) or {},
                    ["amount"] = item.amount,
                    ["quality"] = item.quality,
                    ["createtime"] = item.createtime,
                })
        	end

            Inventories[invType][id].isOpen = false
        end
    end
end

function RemoveFrom(invType, id, slot, itemName, amount)
    local amount = tonumber(amount)

    if Inventories[invType][id].items[slot] and Inventories[invType][id].items[slot].name == itemName then
        if Inventories[invType][id].items[slot].amount > amount then
			Inventories[invType][id].items[slot].amount = Inventories[invType][id].items[slot].amount - amount
        else
            Inventories[invType][id].items[slot] = nil
            if next(Inventories[invType][id].items) == nil then
				Inventories[invType][id].items = {}
			end
        end
    else
        Inventories[invType][id].items[slot] = nil
		if Inventories[invType][id].items == nil then
			Inventories[invType][id].items[slot] = nil
		end
    end
end

function AddTo(invType, id, slot, otherslot, itemName, amount, data)
    local amount = tonumber(amount)
	local itemInfo = ItemData[itemName:lower()]

    if itemInfo.stackable then
        if Inventories[invType][id].items[slot] and Inventories[invType][id].items[slot].name == itemName then
			Inventories[invType][id].items[slot].amount = Inventories[invType][id].items[slot].amount + amount
		else
            SetSlotItem(invType, id, slot, itemInfo, amount, data.info, data.quality, data.createtime)
		end
    else
		if Inventories[invType][id].items[slot] and Inventories[invType][id].items[slot].name == itemName then
            SetSlotItem(invType, id, otherslot, itemInfo, amount, data.info, data.quality, data.createtime)
		else
            SetSlotItem(invType, id, slot, itemInfo, amount, data.info, data.quality, data.createtime)
		end
	end
end

function SetSlotItem(invType, id, slot, itemInfo, amount, info, quality, createtime)
    Inventories[invType][id].items[slot] = {
        name = itemInfo["name"],
        label = itemInfo["label"],
        weight = itemInfo["weight"],
        type = itemInfo["type"],
        ammotype = itemInfo["ammotype"],
        stackable = itemInfo["stackable"],
        useable = itemInfo["useable"],
        shouldClose = itemInfo["shouldClose"],
        combinable = itemInfo["combinable"],
        decayrate = itemInfo["decayrate"],
        image = itemInfo["image"],
        description = itemInfo["description"] and itemInfo["description"] or "",
        slot = tonumber(slot),
        amount = tonumber(amount),
        info = info or {},
        quality = tonumber(quality),
        createtime = tonumber(createtime),
        id = id,
    }
end

function GetFrom(invType, id)
	local items = exports['dg-sql']:query(
        [[
        SELECT slot, name, info, amount, quality, createtime
        FROM inventoryitems 
        WHERE inventorytype = :inventorytype AND inventoryid = :inventoryid
        ]], {
        ["inventorytype"] = invType,
        ["inventoryid"] = id,
    })

    local retval = {}
    if items then
        for _, item in pairs(items) do
            if item then
                local itemInfo = ItemData[item.name:lower()]
                if itemInfo then
                    retval[item.slot] = {
                        name = itemInfo["name"],
                        label = itemInfo["label"],
                        weight = itemInfo["weight"],
                        type = itemInfo["type"],
                        ammotype = itemInfo["ammotype"],
                        stackable = itemInfo["stackable"],
                        useable = itemInfo["useable"],
                        shouldClose = itemInfo["shouldClose"],
                        combinable = itemInfo["combinable"],
                        decayrate = itemInfo["decayrate"],
                        image = itemInfo["image"],
                        description = itemInfo["description"] and itemInfo["description"] or "",
                        slot = tonumber(item.slot),
                        amount = tonumber(item.amount),
                        info = json.decode(item.info) or {},
                        quality = tonumber(item.quality),
                        createtime = tonumber(item.createtime),
                    }
                end
            end
        end
    end
    return retval
end

function SetupShopItems(shopItems)
	local retval = {}
	if shopItems and next(shopItems) then
		for _, item in pairs(shopItems) do
			local itemInfo = ItemData[item.name:lower()]
			if itemInfo then
				retval[item.slot] = {
                    name = itemInfo["name"],
                    label = itemInfo["label"],
                    weight = itemInfo["weight"],
                    type = itemInfo["type"],
                    ammotype = itemInfo["ammotype"],
                    stackable = itemInfo["stackable"],
                    useable = itemInfo["useable"],
                    shouldClose = itemInfo["shouldClose"],
                    combinable = itemInfo["combinable"],
                    decayrate = itemInfo["decayrate"],
                    image = itemInfo["image"],
                    description = itemInfo["description"] and itemInfo["description"] or "",
                    slot = tonumber(item.slot),
                    amount = tonumber(item.amount),
                    info = item.info and item.info or "",
                    quality = 100,
                    createtime = os.time(),
					price = item.price,
				}
			end
		end
	end
	return retval
end

function CreateId(invType)
	if Inventories[invType] then
        local id
        repeat
            id = math.random(10000, 99999)
        until not Inventories[invType][id]
        
		return id
	else
		return math.random(10000, 99999)
	end
end

function CreateNewDrop(source, fromSlot, toSlot, itemAmount)
	local Player = DGCore.Functions.GetPlayer(source)
	local itemData = Player.Functions.GetItemBySlot(fromSlot)
	local coords = GetEntityCoords(GetPlayerPed(source))

	if Player.Functions.RemoveItem(itemData.name, itemAmount, itemData.slot) then
		local itemInfo = ItemData[itemData.name:lower()]
		local id = CreateId("drop")
		Inventories["drop"][id] = {}
		Inventories["drop"][id].items = {}

        Drops[id] = {
            id = id, 
            coords = {
                x = coords.x, 
                y = coords.y, 
                z = coords.z
            },
            created = os.clock()
        }

        SetSlotItem("drop", id, toSlot, itemInfo, itemAmount, itemData.info, itemData.quality, itemData.createtime)

		TriggerEvent("qb-log:server:CreateLog", "drop", "New Item Drop", "red", "**".. GetPlayerName(source) .. "** (citizenid: *"..Player.PlayerData.citizenid.."* | id: *"..source.."*) dropped new item; name: **"..itemData.name.."**, amount: **" .. itemAmount .. "**")
		TriggerClientEvent("inventory:client:DropItemAnim", source)
		TriggerClientEvent("inventory:client:AddDropItem", -1, id, source, coords)
	else
		TriggerClientEvent("DGCore:Notify", source, "You don\'t have this item!", "error")
	end
end

function IsVehicleOwned(plate)
    local result = exports['dg-sql']:scalar("SELECT 1 from player_vehicles WHERE plate = ?", {plate})
    if result then 
        return true 
    else 
        return false 
    end
end

function MoveItemFromPlayer(src, Player, toInventory, fromSlot, toSlot, fromAmount, toAmount)
    local invType = DGCore.Shared.SplitStr(toInventory, "-")[1]
    local id = DGCore.Shared.SplitStr(toInventory, "-")[2]
    id = tonumber(id) and tonumber(id) or id
    local fromItemData = Player.Functions.GetItemBySlot(fromSlot)
    local fromAmount = tonumber(fromAmount) and tonumber(fromAmount) or fromItemData.amount

    local targetPlayer = nil
    if toInventory == "otherplayer" or toInventory == "player" then
        targetPlayer = toInventory == "otherplayer" and DGCore.Functions.GetPlayer(id) or Player
    end

    if fromItemData and fromItemData.amount >= fromAmount then
        local toItemData 
        if targetPlayer then
            toItemData = targetPlayer.Functions.GetItemBySlot(toSlot)
        else
            toItemData = Inventories[invType][id].items[toSlot]
        end
        
        Player.Functions.RemoveItem(fromItemData.name, fromAmount, fromSlot)
    
        if toItemData then
            local itemInfo = ItemData[toItemData.name:lower()]
            local toAmount = tonumber(toAmount)  and tonumber(toAmount) or toItemData.amount
    
            if toItemData.name ~= fromItemData.name then
                if targetPlayer then
                    targetPlayer.Functions.RemoveItem(itemInfo["name"], toAmount, toSlot)
                else
                    RemoveFrom(invType, id, fromSlot, itemInfo["name"], toAmount)
                end
                
                Player.Functions.AddItem(toItemData.name, toAmount, fromSlot, toItemData.info, toItemData.quality, toItemData.createtime)
                TriggerEvent("qb-log:server:CreateLog", invType, "Swapped Item", "orange", "**"..GetPlayerName(src).."** (citizenid: *"..Player.PlayerData.citizenid.."* | id: *"..src.."*) swapped item; name: **"..itemInfo["name"].."**, amount: **"..toAmount.."** with name: **"..fromItemData.name.."**, amount: **"..fromAmount.."** - id: *"..toInventory.."*")
            end
        else
            local itemInfo = ItemData[fromItemData.name:lower()]
            TriggerEvent("qb-log:server:CreateLog", invType, "Moved Item", "red", "**"..GetPlayerName(src).."** (citizenid: *"..Player.PlayerData.citizenid.."* | id: *"..src.."*) moved item; name: **"..itemInfo["name"].."**, amount: **"..fromAmount.."** - id: *"..toInventory.."*")
        end
        
        local itemInfo = ItemData[fromItemData.name:lower()]

        if targetPlayer then
            targetPlayer.Functions.AddItem(itemInfo["name"], fromAmount, toSlot, fromItemData.info, fromItemData.quality, fromItemData.createtime)
        else
            AddTo(invType, id, toSlot, fromSlot, itemInfo["name"], fromAmount, fromItemData)
        end
    else
        TriggerClientEvent("DGCore:Notify", src, "You don\'t have this item!", "error")
    end
end

-- ALSO HANDLES MOVING ITEM IN SAME
function MoveItemToPlayer(src, Player, fromInventory, toInventory, fromSlot, toSlot, fromAmount, toAmount) 
    local invType = DGCore.Shared.SplitStr(fromInventory, "-")[1]
    local id = DGCore.Shared.SplitStr(fromInventory, "-")[2]
    id = tonumber(id) and tonumber(id) or id

    local fromAmount = tonumber(fromAmount) and tonumber(fromAmount) or fromItemData.amount
    local fromItemData
    local targetPlayer = nil
    if fromInventory == "otherplayer" then
        targetPlayer = DGCore.Functions.GetPlayer(id)
        fromItemData = targetPlayer.Functions.GetItemBySlot(fromSlot)
    else
        fromItemData = Inventories[invType][id].items[fromSlot]
    end

    if fromItemData and fromItemData.amount >= fromAmount then
        local itemInfo = ItemData[fromItemData.name:lower()]

        if toInventory == "player" then
            if targetPlayer then
                targetPlayer.Functions.RemoveItem(itemInfo["name"], fromAmount, fromSlot)
            else
                RemoveFrom(invType, id, fromSlot, itemInfo["name"], fromAmount)
            end

            local toItemData = Player.Functions.GetItemBySlot(toSlot)
            if toItemData then
                local itemInfo = ItemData[toItemData.name:lower()]
                local toAmount = tonumber(toAmount) and tonumber(toAmount) or toItemData.amount

                if toItemData.name ~= fromItemData.name then
                    Player.Functions.RemoveItem(toItemData.name, toAmount, toSlot)

                    if targetPlayer then
                        OtherPlayer.Functions.AddItem(itemInfo["name"], toAmount, fromSlot, toItemData.info, toItemData.quality, toItemData.createtime)
                    else
                        AddTo(invType, id, fromSlot, toSlot, itemInfo["name"], toAmount, toItemData)
                    end
                    
                    TriggerEvent("qb-log:server:CreateLog", invType, "Swapped Item", "orange", "**"..GetPlayerName(src).."** (citizenid: *"..Player.PlayerData.citizenid.."* | id: *"..src.."*) swapped item; name: **"..toItemData.name.."**, amount: **"..toAmount.."** with item; name: **"..itemInfo["name"].."**, amount: **"..toAmount.."** id: *"..fromInventory.."*")
                else
                    TriggerEvent("qb-log:server:CreateLog", invType, "Stacked Item", "orange", "**"..GetPlayerName(src).."** (citizenid: *"..Player.PlayerData.citizenid.."* | id: *"..src.."*) stacked item; name: **"..toItemData.name.."**, amount: **"..toAmount.."** from id: *"..fromInventory.."*")
                end
            else
                TriggerEvent("qb-log:server:CreateLog", invType, "Received Item", "green", "**"..GetPlayerName(src).."** (citizenid: *"..Player.PlayerData.citizenid.."* | id: *"..src.."*) received item; name: **"..fromItemData.name.."**, amount: **"..fromAmount.."** id: *"..fromInventory.."*")
            end
            
            if invType == "stash" or invType == "glovebox" or invType == "trunk" then
                SaveItems(invType, id, Inventories[invType][id].items)
            end
            
            Player.Functions.AddItem(fromItemData.name, fromAmount, toSlot, fromItemData.info, fromItemData.quality, fromItemData.createtime)
        else
            local toItemData
            if targetPlayer then
                toItemData = targetPlayer.Functions.GetItemBySlot(toSlot)
                targetPlayer.Functions.RemoveItem(itemInfo["name"], fromAmount, fromSlot)
            else
                toItemData = Inventories[invType][id].items[toSlot]
                RemoveFrom(invType, id, fromSlot, itemInfo["name"], fromAmount)
            end

            if toItemData then
                local itemInfo = ItemData[toItemData.name:lower()]
                local toAmount = tonumber(toAmount)  and tonumber(toAmount) or toItemData.amount

                if toItemData.name ~= fromItemData.name then
                    if targetPlayer then
                        targetPlayer.Functions.RemoveItem(itemInfo["name"], toAmount, toSlot)
                        targetPlayer.Functions.AddItem(itemInfo["name"], toAmount, fromSlot, toItemData.info, toItemData.quality, toItemData.createtime)
                    else
                        RemoveFrom(invType, id, toSlot, itemInfo["name"], toAmount)
                        AddTo(invType, id, fromSlot, toSlot, itemInfo["name"], toAmount, toItemData)
                    end
                end
            end

            local itemInfo = ItemData[fromItemData.name:lower()]

            if targetPlayer then
                targetPlayer.Functions.AddItem(itemInfo["name"], fromAmount, toSlot, fromItemData.info, fromItemData.quality, fromItemData.createtime)
            else
                AddTo(invType, id, toSlot, fromSlot, itemInfo["name"], fromAmount, fromItemData)
            end
            
        end
    else
        TriggerClientEvent("DGCore:Notify", src, "Item doesn\'t exist??", "error")
    end
end

function UpdateQualityOnTime(items) 
    if items and next(items) then
        for slot, item in pairs(items) do
            if item.decayrate and item.createtime then
                local timeDiff = os.difftime(os.time(), item.createtime)
                item.quality = 100 - math.floor((timeDiff / (item.decayrate * 60)) * 100)
                if item.quality <= 0 then 
                    items[slot] = nil
                    TriggerEvent("qb-log:server:CreateLog", "itembroke", "Item broke", "orange", "Item broke: "..item.label)
                end
            end
        end
    end

    return items
end