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
		[1] = {costs = DGCore.Shared.Items["metalscrap"]["label"] .. ": 140x, " .. DGCore.Shared.Items["steel"]["label"] .. ": 250x, " .. DGCore.Shared.Items["rubber"]["label"] .. ": 60x"},
		[2] = {costs = DGCore.Shared.Items["metalscrap"]["label"] .. ": 165x, " .. DGCore.Shared.Items["steel"]["label"] .. ": 285x, " .. DGCore.Shared.Items["rubber"]["label"] .. ": 75x"},
		[3] = {costs = DGCore.Shared.Items["metalscrap"]["label"] .. ": 190x, " .. DGCore.Shared.Items["steel"]["label"] .. ": 305x, " .. DGCore.Shared.Items["rubber"]["label"] .. ": 85x, " .. DGCore.Shared.Items["smg_extendedclip"]["label"] .. ": 1x"},
		[4] = {costs = DGCore.Shared.Items["metalscrap"]["label"] .. ": 205x, " .. DGCore.Shared.Items["steel"]["label"] .. ": 340x, " .. DGCore.Shared.Items["rubber"]["label"] .. ": 110x, " .. DGCore.Shared.Items["smg_extendedclip"]["label"] .. ": 2x"},
		[5] = {costs = DGCore.Shared.Items["metalscrap"]["label"] .. ": 230x, " .. DGCore.Shared.Items["steel"]["label"] .. ": 365x, " .. DGCore.Shared.Items["rubber"]["label"] .. ": 130x"},
		[6] = {costs = DGCore.Shared.Items["metalscrap"]["label"] .. ": 255x, " .. DGCore.Shared.Items["steel"]["label"] .. ": 390x, " .. DGCore.Shared.Items["rubber"]["label"] .. ": 145x"},
		[7] = {costs = DGCore.Shared.Items["metalscrap"]["label"] .. ": 270x, " .. DGCore.Shared.Items["steel"]["label"] .. ": 435x, " .. DGCore.Shared.Items["rubber"]["label"] .. ": 155x"},
		[8] = {costs = DGCore.Shared.Items["metalscrap"]["label"] .. ": 300x, " .. DGCore.Shared.Items["steel"]["label"] .. ": 469x, " .. DGCore.Shared.Items["rubber"]["label"] .. ": 170x"},
	}

	local items = {}
	for k, item in pairs(Config.AttachmentCrafting["items"]) do
		local itemInfo = DGCore.Shared.Items[item.name:lower()]
		items[item.slot] = {
			name = itemInfo["name"],
			amount = tonumber(item.amount),
			info = itemInfos[item.slot],
			label = itemInfo["label"],
			description = itemInfo["description"] ~= nil and itemInfo["description"] or "",
			weight = itemInfo["weight"], 
			type = itemInfo["type"], 
			unique = itemInfo["unique"], 
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
		[1] = {costs = DGCore.Shared.Items["metalscrap"]["label"] .. ": 22x, " ..DGCore.Shared.Items["plastic"]["label"] .. ": 32x."},
		[2] = {costs = DGCore.Shared.Items["metalscrap"]["label"] .. ": 30x, " ..DGCore.Shared.Items["plastic"]["label"] .. ": 42x."},
		[3] = {costs = DGCore.Shared.Items["metalscrap"]["label"] .. ": 30x, " ..DGCore.Shared.Items["plastic"]["label"] .. ": 45x, "..DGCore.Shared.Items["aluminum"]["label"] .. ": 28x."},
		[4] = {costs = DGCore.Shared.Items["electronickit"]["label"] .. ": 2x, " ..DGCore.Shared.Items["plastic"]["label"] .. ": 52x, "..DGCore.Shared.Items["steel"]["label"] .. ": 40x."},
		[5] = {costs = DGCore.Shared.Items["metalscrap"]["label"] .. ": 10x, " ..DGCore.Shared.Items["plastic"]["label"] .. ": 50x, "..DGCore.Shared.Items["aluminum"]["label"] .. ": 30x, "..DGCore.Shared.Items["iron"]["label"] .. ": 17x, "..DGCore.Shared.Items["electronickit"]["label"] .. ": 1x."},
		[6] = {costs = DGCore.Shared.Items["metalscrap"]["label"] .. ": 36x, " ..DGCore.Shared.Items["steel"]["label"] .. ": 24x, "..DGCore.Shared.Items["aluminum"]["label"] .. ": 28x."},
		[7] = {costs = DGCore.Shared.Items["metalscrap"]["label"] .. ": 32x, " ..DGCore.Shared.Items["steel"]["label"] .. ": 43x, "..DGCore.Shared.Items["plastic"]["label"] .. ": 61x."},
		[8] = {costs = DGCore.Shared.Items["metalscrap"]["label"] .. ": 50x, " ..DGCore.Shared.Items["steel"]["label"] .. ": 37x, "..DGCore.Shared.Items["copper"]["label"] .. ": 26x."},
		[9] = {costs = DGCore.Shared.Items["iron"]["label"] .. ": 60x, " ..DGCore.Shared.Items["glass"]["label"] .. ": 30x."},
		[10] = {costs = DGCore.Shared.Items["aluminum"]["label"] .. ": 60x, " ..DGCore.Shared.Items["glass"]["label"] .. ": 30x."},
		[11] = {costs = DGCore.Shared.Items["iron"]["label"] .. ": 33x, " ..DGCore.Shared.Items["steel"]["label"] .. ": 44x, "..DGCore.Shared.Items["plastic"]["label"] .. ": 55x, "..DGCore.Shared.Items["aluminum"]["label"] .. ": 22x."},
		[12] = {costs = DGCore.Shared.Items["iron"]["label"] .. ": 50x, " ..DGCore.Shared.Items["steel"]["label"] .. ": 50x, "..DGCore.Shared.Items["screwdriverset"]["label"] .. ": 3x, "..DGCore.Shared.Items["advancedlockpick"]["label"] .. ": 2x."},
	}

	local items = {}
	for k, item in pairs(Config.CraftingItems) do
		local itemInfo = DGCore.Shared.Items[item.name:lower()]
		items[item.slot] = {
			name = itemInfo["name"],
			amount = tonumber(item.amount),
			info = itemInfos[item.slot],
			label = itemInfo["label"],
			description = itemInfo["description"] ~= nil and itemInfo["description"] or "",
			weight = itemInfo["weight"], 
			type = itemInfo["type"], 
			unique = itemInfo["unique"], 
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
