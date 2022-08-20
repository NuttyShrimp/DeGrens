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
          print('Deprecated inventory opening method. Please update to new export')
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
          print('Deprecated inventory opening method. Please update to new export')
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
		[1] = {costs = DGX.Inventory.getItemData("metalscrap")["label"] .. ": 140x, " .. DGX.Inventory.getItemData("steel")["label"] .. ": 250x, " .. DGX.Inventory.getItemData("rubber")["label"] .. ": 60x"},
		[2] = {costs = DGX.Inventory.getItemData("metalscrap")["label"] .. ": 165x, " .. DGX.Inventory.getItemData("steel")["label"] .. ": 285x, " .. DGX.Inventory.getItemData("rubber")["label"] .. ": 75x"},
		[3] = {costs = DGX.Inventory.getItemData("metalscrap")["label"] .. ": 190x, " .. DGX.Inventory.getItemData("steel")["label"] .. ": 305x, " .. DGX.Inventory.getItemData("rubber")["label"] .. ": 85x, " .. DGX.Inventory.getItemData("smg_extendedclip")["label"] .. ": 1x"},
		[4] = {costs = DGX.Inventory.getItemData("metalscrap")["label"] .. ": 205x, " .. DGX.Inventory.getItemData("steel")["label"] .. ": 340x, " .. DGX.Inventory.getItemData("rubber")["label"] .. ": 110x, " .. DGX.Inventory.getItemData("smg_extendedclip")["label"] .. ": 2x"},
		[5] = {costs = DGX.Inventory.getItemData("metalscrap")["label"] .. ": 230x, " .. DGX.Inventory.getItemData("steel")["label"] .. ": 365x, " .. DGX.Inventory.getItemData("rubber")["label"] .. ": 130x"},
		[6] = {costs = DGX.Inventory.getItemData("metalscrap")["label"] .. ": 255x, " .. DGX.Inventory.getItemData("steel")["label"] .. ": 390x, " .. DGX.Inventory.getItemData("rubber")["label"] .. ": 145x"},
		[7] = {costs = DGX.Inventory.getItemData("metalscrap")["label"] .. ": 270x, " .. DGX.Inventory.getItemData("steel")["label"] .. ": 435x, " .. DGX.Inventory.getItemData("rubber")["label"] .. ": 155x"},
		[8] = {costs = DGX.Inventory.getItemData("metalscrap")["label"] .. ": 300x, " .. DGX.Inventory.getItemData("steel")["label"] .. ": 469x, " .. DGX.Inventory.getItemData("rubber")["label"] .. ": 170x"},
	}

	local items = {}
	for k, item in pairs(Config.AttachmentCrafting["items"]) do
		local itemInfo = DGX.Inventory.getItemData(item.name:lower())
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
		[1] = {costs = DGX.Inventory.getItemData("metalscrap")["label"] .. ": 22x, " ..DGX.Inventory.getItemData("plastic")["label"] .. ": 32x."},
		[2] = {costs = DGX.Inventory.getItemData("metalscrap")["label"] .. ": 30x, " ..DGX.Inventory.getItemData("plastic")["label"] .. ": 42x."},
		[3] = {costs = DGX.Inventory.getItemData("metalscrap")["label"] .. ": 30x, " ..DGX.Inventory.getItemData("plastic")["label"] .. ": 45x, "..DGX.Inventory.getItemData("aluminum")["label"] .. ": 28x."},
		[4] = {costs = DGX.Inventory.getItemData("electronickit")["label"] .. ": 2x, " ..DGX.Inventory.getItemData("plastic")["label"] .. ": 52x, "..DGX.Inventory.getItemData("steel")["label"] .. ": 40x."},
		[5] = {costs = DGX.Inventory.getItemData("metalscrap")["label"] .. ": 10x, " ..DGX.Inventory.getItemData("plastic")["label"] .. ": 50x, "..DGX.Inventory.getItemData("aluminum")["label"] .. ": 30x, "..DGX.Inventory.getItemData("iron")["label"] .. ": 17x, "..DGX.Inventory.getItemData("electronickit")["label"] .. ": 1x."},
		[6] = {costs = DGX.Inventory.getItemData("metalscrap")["label"] .. ": 36x, " ..DGX.Inventory.getItemData("steel")["label"] .. ": 24x, "..DGX.Inventory.getItemData("aluminum")["label"] .. ": 28x."},
		[7] = {costs = DGX.Inventory.getItemData("metalscrap")["label"] .. ": 32x, " ..DGX.Inventory.getItemData("steel")["label"] .. ": 43x, "..DGX.Inventory.getItemData("plastic")["label"] .. ": 61x."},
		[8] = {costs = DGX.Inventory.getItemData("metalscrap")["label"] .. ": 50x, " ..DGX.Inventory.getItemData("steel")["label"] .. ": 37x, "..DGX.Inventory.getItemData("copper")["label"] .. ": 26x."},
		[9] = {costs = DGX.Inventory.getItemData("iron")["label"] .. ": 60x, " ..DGX.Inventory.getItemData("glass")["label"] .. ": 30x."},
		[10] = {costs = DGX.Inventory.getItemData("aluminum")["label"] .. ": 60x, " ..DGX.Inventory.getItemData("glass")["label"] .. ": 30x."},
		[11] = {costs = DGX.Inventory.getItemData("iron")["label"] .. ": 33x, " ..DGX.Inventory.getItemData("steel")["label"] .. ": 44x, "..DGX.Inventory.getItemData("plastic")["label"] .. ": 55x, "..DGX.Inventory.getItemData("aluminum")["label"] .. ": 22x."},
		[12] = {costs = DGX.Inventory.getItemData("iron")["label"] .. ": 50x, " ..DGX.Inventory.getItemData("steel")["label"] .. ": 50x, "..DGX.Inventory.getItemData("screwdriverset")["label"] .. ": 3x, "..DGX.Inventory.getItemData("advancedlockpick")["label"] .. ": 2x."},
	}

	local items = {}
	for k, item in pairs(Config.CraftingItems) do
		local itemInfo = DGX.Inventory.getItemData(item.name:lower())
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
