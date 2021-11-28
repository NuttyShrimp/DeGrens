local itemInfos = {}

function DrawText3D(x, y, z, text)
	SetTextScale(0.35, 0.35)
    SetTextFont(4)
    SetTextProportional(1)
    SetTextColour(255, 255, 255, 215)
    SetTextEntry("STRING")
    SetTextCentre(true)
    AddTextComponentString(text)
    SetDrawOrigin(x,y,z, 0)
    DrawText(0.0, 0.0)
    local factor = (string.len(text)) / 370
    DrawRect(0.0, 0.0+0.0125, 0.017+ factor, 0.03, 0, 0, 0, 75)
    ClearDrawOrigin()
end

local maxDistance = 1.25

Citizen.CreateThread(function()
	while true do
		Citizen.Wait(0)
		local pos, awayFromObject = GetEntityCoords(PlayerPedId()), true
		local craftObject = GetClosestObjectOfType(pos, 2.0, -573669520, false, false, false)
		if craftObject ~= 0 then
			local objectPos = GetEntityCoords(craftObject)
			if #(pos - objectPos) < 1.5 then
				awayFromObject = false
				DrawText3D(objectPos.x, objectPos.y, objectPos.z + 1.0, "~g~E~w~ - Craft")
				if IsControlJustReleased(0, 38) then
					local crafting = {}
					crafting.label = "Crafting"
					crafting.items = GetThresholdItems()
					TriggerServerEvent("inventory:server:OpenInventory", "crafting", math.random(1, 99), crafting)
				end
			end
		end

		if awayFromObject then
			Citizen.Wait(1000)
		end
	end
end)

Citizen.CreateThread(function()
	while true do
		local pos = GetEntityCoords(PlayerPedId())
		local inRange = false
		local distance = #(pos - vector3(Config.AttachmentCrafting["location"].x, Config.AttachmentCrafting["location"].y, Config.AttachmentCrafting["location"].z))

		if distance < 10 then
			inRange = true
			if distance < 1.5 then
				DrawText3D(Config.AttachmentCrafting["location"].x, Config.AttachmentCrafting["location"].y, Config.AttachmentCrafting["location"].z, "~g~E~w~ - Craft")
				if IsControlJustPressed(0, 38) then
					local crafting = {}
					crafting.label = "Attachment Crafting"
					crafting.items = GetAttachmentThresholdItems()
					TriggerServerEvent("inventory:server:OpenInventory", "attachment_crafting", math.random(1, 99), crafting)
				end
			end
		end

		if not inRange then
			Citizen.Wait(1000)
		end

		Citizen.Wait(3)
	end
end)

function GetThresholdItems()
	ItemsToItemInfo()
	local items = {}
	for k, item in pairs(Config.CraftingItems) do
		if DGCore.Functions.GetPlayerData().metadata["craftingrep"] >= Config.CraftingItems[k].threshold then
			items[k] = Config.CraftingItems[k]
		end
	end
	return items
end

function SetupAttachmentItemsInfo()
	itemInfos = {
		[1] = {costs = exports["dg-inventory"]:GetItemData()["metalscrap"]["label"] .. ": 140x, " .. exports["dg-inventory"]:GetItemData()["steel"]["label"] .. ": 250x, " .. exports["dg-inventory"]:GetItemData()["rubber"]["label"] .. ": 60x"},
		[2] = {costs = exports["dg-inventory"]:GetItemData()["metalscrap"]["label"] .. ": 165x, " .. exports["dg-inventory"]:GetItemData()["steel"]["label"] .. ": 285x, " .. exports["dg-inventory"]:GetItemData()["rubber"]["label"] .. ": 75x"},
		[3] = {costs = exports["dg-inventory"]:GetItemData()["metalscrap"]["label"] .. ": 190x, " .. exports["dg-inventory"]:GetItemData()["steel"]["label"] .. ": 305x, " .. exports["dg-inventory"]:GetItemData()["rubber"]["label"] .. ": 85x, " .. exports["dg-inventory"]:GetItemData()["smg_extendedclip"]["label"] .. ": 1x"},
		[4] = {costs = exports["dg-inventory"]:GetItemData()["metalscrap"]["label"] .. ": 205x, " .. exports["dg-inventory"]:GetItemData()["steel"]["label"] .. ": 340x, " .. exports["dg-inventory"]:GetItemData()["rubber"]["label"] .. ": 110x, " .. exports["dg-inventory"]:GetItemData()["smg_extendedclip"]["label"] .. ": 2x"},
		[5] = {costs = exports["dg-inventory"]:GetItemData()["metalscrap"]["label"] .. ": 230x, " .. exports["dg-inventory"]:GetItemData()["steel"]["label"] .. ": 365x, " .. exports["dg-inventory"]:GetItemData()["rubber"]["label"] .. ": 130x"},
		[6] = {costs = exports["dg-inventory"]:GetItemData()["metalscrap"]["label"] .. ": 255x, " .. exports["dg-inventory"]:GetItemData()["steel"]["label"] .. ": 390x, " .. exports["dg-inventory"]:GetItemData()["rubber"]["label"] .. ": 145x"},
		[7] = {costs = exports["dg-inventory"]:GetItemData()["metalscrap"]["label"] .. ": 270x, " .. exports["dg-inventory"]:GetItemData()["steel"]["label"] .. ": 435x, " .. exports["dg-inventory"]:GetItemData()["rubber"]["label"] .. ": 155x"},
		[8] = {costs = exports["dg-inventory"]:GetItemData()["metalscrap"]["label"] .. ": 300x, " .. exports["dg-inventory"]:GetItemData()["steel"]["label"] .. ": 469x, " .. exports["dg-inventory"]:GetItemData()["rubber"]["label"] .. ": 170x"},
	}

	local items = {}
	for k, item in pairs(Config.AttachmentCrafting["items"]) do
		local itemInfo = exports["dg-inventory"]:GetItemData()[item.name:lower()]
		items[item.slot] = {
			name = itemInfo["name"],
			amount = tonumber(item.amount),
			info = itemInfos[item.slot],
			label = itemInfo["label"],
			description = itemInfo["description"] ~= nil and itemInfo["description"] or "",
			weight = itemInfo["weight"], 
			type = itemInfo["type"], 
			stackable = itemInfo["stackable"], 
			useable = itemInfo["useable"], 
			image = itemInfo["image"],
			slot = item.slot,
			costs = item.costs,
			threshold = item.threshold,
			points = item.points,
		}
	end
	Config.AttachmentCrafting["items"] = items
end

function GetAttachmentThresholdItems()
	SetupAttachmentItemsInfo()
	local items = {}
	for k, item in pairs(Config.AttachmentCrafting["items"]) do
		if DGCore.Functions.GetPlayerData().metadata["attachmentcraftingrep"] >= Config.AttachmentCrafting["items"][k].threshold then
			items[k] = Config.AttachmentCrafting["items"][k]
		end
	end
	return items
end

function ItemsToItemInfo()
	itemInfos = {
		[1] = {costs = exports["dg-inventory"]:GetItemData()["metalscrap"]["label"] .. ": 22x, " ..exports["dg-inventory"]:GetItemData()["plastic"]["label"] .. ": 32x."},
		[2] = {costs = exports["dg-inventory"]:GetItemData()["metalscrap"]["label"] .. ": 30x, " ..exports["dg-inventory"]:GetItemData()["plastic"]["label"] .. ": 42x."},
		[3] = {costs = exports["dg-inventory"]:GetItemData()["metalscrap"]["label"] .. ": 30x, " ..exports["dg-inventory"]:GetItemData()["plastic"]["label"] .. ": 45x, "..exports["dg-inventory"]:GetItemData()["aluminum"]["label"] .. ": 28x."},
		[4] = {costs = exports["dg-inventory"]:GetItemData()["electronickit"]["label"] .. ": 2x, " ..exports["dg-inventory"]:GetItemData()["plastic"]["label"] .. ": 52x, "..exports["dg-inventory"]:GetItemData()["steel"]["label"] .. ": 40x."},
		[5] = {costs = exports["dg-inventory"]:GetItemData()["metalscrap"]["label"] .. ": 10x, " ..exports["dg-inventory"]:GetItemData()["plastic"]["label"] .. ": 50x, "..exports["dg-inventory"]:GetItemData()["aluminum"]["label"] .. ": 30x, "..exports["dg-inventory"]:GetItemData()["iron"]["label"] .. ": 17x, "..exports["dg-inventory"]:GetItemData()["electronickit"]["label"] .. ": 1x."},
		[6] = {costs = exports["dg-inventory"]:GetItemData()["metalscrap"]["label"] .. ": 36x, " ..exports["dg-inventory"]:GetItemData()["steel"]["label"] .. ": 24x, "..exports["dg-inventory"]:GetItemData()["aluminum"]["label"] .. ": 28x."},
		[7] = {costs = exports["dg-inventory"]:GetItemData()["metalscrap"]["label"] .. ": 32x, " ..exports["dg-inventory"]:GetItemData()["steel"]["label"] .. ": 43x, "..exports["dg-inventory"]:GetItemData()["plastic"]["label"] .. ": 61x."},
		[8] = {costs = exports["dg-inventory"]:GetItemData()["metalscrap"]["label"] .. ": 50x, " ..exports["dg-inventory"]:GetItemData()["steel"]["label"] .. ": 37x, "..exports["dg-inventory"]:GetItemData()["copper"]["label"] .. ": 26x."},
		[9] = {costs = exports["dg-inventory"]:GetItemData()["iron"]["label"] .. ": 60x, " ..exports["dg-inventory"]:GetItemData()["glass"]["label"] .. ": 30x."},
		[10] = {costs = exports["dg-inventory"]:GetItemData()["aluminum"]["label"] .. ": 60x, " ..exports["dg-inventory"]:GetItemData()["glass"]["label"] .. ": 30x."},
		[11] = {costs = exports["dg-inventory"]:GetItemData()["iron"]["label"] .. ": 33x, " ..exports["dg-inventory"]:GetItemData()["steel"]["label"] .. ": 44x, "..exports["dg-inventory"]:GetItemData()["plastic"]["label"] .. ": 55x, "..exports["dg-inventory"]:GetItemData()["aluminum"]["label"] .. ": 22x."},
		[12] = {costs = exports["dg-inventory"]:GetItemData()["iron"]["label"] .. ": 50x, " ..exports["dg-inventory"]:GetItemData()["steel"]["label"] .. ": 50x, "..exports["dg-inventory"]:GetItemData()["screwdriverset"]["label"] .. ": 3x, "..exports["dg-inventory"]:GetItemData()["advancedlockpick"]["label"] .. ": 2x."},
	}

	local items = {}
	for k, item in pairs(Config.CraftingItems) do
		local itemInfo = exports["dg-inventory"]:GetItemData()[item.name:lower()]
		items[item.slot] = {
			name = itemInfo["name"],
			amount = tonumber(item.amount),
			info = itemInfos[item.slot],
			label = itemInfo["label"],
			description = itemInfo["description"] ~= nil and itemInfo["description"] or "",
			weight = itemInfo["weight"], 
			type = itemInfo["type"], 
			stackable = itemInfo["stackable"], 
			useable = itemInfo["useable"], 
			image = itemInfo["image"],
			slot = item.slot,
			costs = item.costs,
			threshold = item.threshold,
			points = item.points,
		}
	end
	Config.CraftingItems = items
end
