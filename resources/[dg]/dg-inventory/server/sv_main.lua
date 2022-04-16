ItemData = {}
DecayingItems = {}

ShopItems = {}

Inventories = {
	["drop"] = {},
	["trunk"] = {},
	["glovebox"] = {},
	["stash"] = {},
	["dumpster"] = {},
	["give"] = {},
}

-- save locations for newly joined players
Drops = {}
Dumpsters = {}

DGCore.Commands.Add("resetinv", "Reset Inventory (Admin Only)", { { name = "type", help = "stash/trunk/glovebox" }, { name = "id/plate", help = "ID of stash or license plate" } }, true, function(source, args)
	local invType = args[1]:lower()
	table.remove(args, 1)
	local invId = table.concat(args, " ")
	if invType and invId then
		if invType == "trunk" or invType == "glovebox" or invType == "stash" then
			if Inventories[invType][invId] then
				Inventories[invType][invId].isOpen = false
			end
		else
			TriggerClientEvent("DGCore:Notify", source, "Not a valid type..", "error")
		end
	else
		TriggerClientEvent("DGCore:Notify", source, "Arguments not filled out correctly..", "error")
	end
end, "admin")

DGCore.Commands.Add("giveitem", "Give An Item (Admin Only)", { { name = "id", help = "Player ID" }, { name = "item", help = "Name of the item (not a label)" }, { name = "amount", help = "Amount of items" } }, true, function(source, args)
	local Player = DGCore.Functions.GetPlayer(tonumber(args[1]))
	local amount = tonumber(args[3])
	local itemData = ItemData[tostring(args[2]):lower()]
	if Player then
		if amount > 0 then
			if itemData then
				-- check iteminfo
				local info = {}
				if itemData["name"] == "id_card" then
					info.citizenid = Player.PlayerData.citizenid
					info.firstname = Player.PlayerData.charinfo.firstname
					info.lastname = Player.PlayerData.charinfo.lastname
					info.birthdate = Player.PlayerData.charinfo.birthdate
					info.gender = Player.PlayerData.charinfo.gender
					info.nationality = Player.PlayerData.charinfo.nationality
				elseif itemData["name"] == "driver_license" then
					info.firstname = Player.PlayerData.charinfo.firstname
					info.lastname = Player.PlayerData.charinfo.lastname
					info.birthdate = Player.PlayerData.charinfo.birthdate
					info.type = "Class C Driver License"
				elseif itemData["type"] == "weapon" then
					amount = 1
					info.serie = tostring(DGCore.Shared.RandomInt(2) .. DGCore.Shared.RandomStr(3) .. DGCore.Shared.RandomInt(1) .. DGCore.Shared.RandomStr(2) .. DGCore.Shared.RandomInt(3) .. DGCore.Shared.RandomStr(4))
				elseif itemData["name"] == "harness" then
					info.uses = 20
				elseif itemData["name"] == "markedbills" then
					info.worth = math.random(5000, 10000)
                elseif itemData["name"] == "meth_brick" then
                    info.purity = math.random(0, 100)
				end

				if Player.Functions.AddItem(itemData["name"], amount, false, info) then
					TriggerClientEvent("DGCore:Notify", source, "You Have Given " .. GetPlayerName(tonumber(args[1])) .. " " .. amount .. " " .. itemData["name"] .. "", "success")
				else
					TriggerClientEvent("DGCore:Notify", source, "Can\'t give item!", "error")
				end
			else
				TriggerClientEvent("DGCore:Notify", source, "Item Does Not Exist", "error")
			end
		else
			TriggerClientEvent("DGCore:Notify", source, "Invalid Amount", "error")
		end
	else
		TriggerClientEvent("DGCore:Notify", source, "Player is not online", "error")
	end
end, "admin")

-- TODO replace with pictures
DGCore.Functions.CreateUseableItem("driver_license", function(source, item)
	for _, v in pairs(DGCore.Functions.GetPlayers()) do
		local PlayerPed = GetPlayerPed(source)
		local TargetPed = GetPlayerPed(v)
		local dist = #(GetEntityCoords(PlayerPed) - GetEntityCoords(TargetPed))
		if dist < 3.0 then
		  exports['dg-chat']:addMessage(v, {
		    prefix = 'Drivers License: ',
		    message = ('<br><br> <strong>First Name:</strong> %s <br><strong>Last Name:</strong> %s <br><strong>Birth Date:</strong> %s <br><strong>Licenses:</strong> %s'):format(
					item.info.firstname,
					item.info.lastname,
					item.info.birthdate,
					item.info.type
        ),
        type = 'warning'
		  })
		end
	end
end)

DGCore.Functions.CreateUseableItem("id_card", function(source, item)
	for _, v in pairs(DGCore.Functions.GetPlayers()) do
		local PlayerPed = GetPlayerPed(source)
		local TargetPed = GetPlayerPed(v)
		local dist = #(GetEntityCoords(PlayerPed) - GetEntityCoords(TargetPed))
		if dist < 3.0 then
			local gender = "Man"
			if item.info.gender == 1 then
				gender = "Woman"
			end
			exports['dg-chat']:addMessage(v, {
			  prefix = "ID Card: ",
				template = ("<br><br> <strong>Civ ID:</strong> %s <br><strong>First Name:</strong> %s <br><strong>Last Name:</strong> %s <br><strong>Birthdate:</strong> %s <br><strong>Gender:</strong> %s <br><strong>Nationality:</strong> %s"):format(
					item.info.citizenid,
					item.info.firstname,
					item.info.lastname,
					item.info.birthdate,
					gender,
					item.info.nationality
				),
				type = "warning",
			})
		end
	end
end)

DGCore.Functions.CreateCallback("inventory:server:CreateId", function(source, cb, invType)
	cb(CreateId(invType))
end)

DGCore.Functions.CreateCallback('inventory:server:GetGiveItem', function(source, cb, id)
    local itemData = nil
    if id and Inventories["give"][id] then -- check if ID actually exists
        if Inventories["give"][id].items[1] then
            itemData = Inventories["give"][id].items[1]
        end
    end

    cb(itemData)
end)

-- remove drops when they older than certain time
Citizen.CreateThread(function()
	while true do
		Citizen.Wait(1000 * 60 * 10)
		for k, v in pairs(Drops) do
			if v then
				if os.clock() - v.created > 60 * 15 then
					Inventories["drop"][k] = nil
					TriggerClientEvent("inventory:client:RemoveDropItem", -1, k)
					Drops[k] = nil
				end
			end
		end
	end
end)

CreateThread(function()
	-- if you want to save items in DB
	--local result = exports['dg-sql']:query("SELECT * FROM items")

	-- if you want to save items in json file
	local result = json.decode(LoadResourceFile(GetCurrentResourceName(), "items.json"))

	if result then
		for _, item in pairs(result) do
			if item then
				ItemData[item.name] = {
					["name"] = item.name,
					["label"] = item.label,
					["weight"] = tonumber(item.weight),
					["type"] = item.type,
					["stackable"] = item.stackable or false,
					["useable"] = item.useable or false,
					["shouldClose"] = item.shouldClose or false,
					["combinable"] = item.combinable and json.decode(item.combinable) or nil,
					["decayrate"] = tonumber(item.decayrate),
					["image"] = item.image,
					["description"] = item.description,
				}

				-- for weapons we also need to be able to get data from the hash because we cant convert the hash we get from certain natives to the weapon name
				if item.type == "weapon" then
					ItemData[GetHashKey(item.name)] = {
						["name"] = item.name,
						["label"] = item.label,
						["weight"] = tonumber(item.weight),
						["type"] = item.type,
						["stackable"] = item.stackable or false,
						["useable"] = item.useable or false,
						["shouldClose"] = item.shouldClose or false,
						["combinable"] = item.combinable and json.decode(item.combinable) or nil,
						["decayrate"] = tonumber(item.decayrate),
						["image"] = item.image,
						["description"] = item.description,
					}
				end
			end
		end
	end
end)

DGCore.Functions.CreateCallback("inventory:server:SetupData", function(source, cb)
	retval = { Dumpsters, Drops }
	cb(retval)
end)



