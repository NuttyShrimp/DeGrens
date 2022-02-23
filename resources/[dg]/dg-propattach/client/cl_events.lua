local currentEntities = {
	phoneProp = 0,
	inventoryHoldableProp = 0,
}

RegisterNetEvent('onResourceStop', function(res)
	if res == GetCurrentResourceName() then
		for _, v in pairs(currentEntities) do
			if DoesEntityExist(v) then
				DeleteEntity(v)
			end
		end
	end
end)

removePhoneItem = function()
	DeleteEntity(currentEntities.phoneProp)
	currentEntities.phoneProp = 0
end
exports('removePhoneItem', removePhoneItem)

attachPhoneItem = function(item)
	if item == nil then item = "phone" end
	removePhoneItem()

	local listEntry = props[item]
	if listEntry == nil then return end

	local ped = PlayerPedId()
	-- SetCurrentPedWeapon(ped, `weapon_unarmed`)
	local bone = GetPedBoneIndex(ped, listEntry.boneId)
	RequestModel(listEntry.model)
	while not HasModelLoaded(listEntry.model) do Wait(0) end
	removePhoneItem()
	currentEntities.phoneProp = CreateObject(listEntry.model, GetEntityCoords(ped), 1, 1, 0)
	AttachEntityToEntity(currentEntities.phoneProp, ped, bone, listEntry.x, listEntry.y, listEntry.z, listEntry.rx, listEntry.ry, listEntry.rz, 1, 1, 0, 1, 1.0, 1)
end
exports('attachPhoneItem', attachPhoneItem)

removeInventoryHoldable = function()
	DeleteEntity(currentEntities.inventoryHoldableProp)
	currentEntities.inventoryHoldableProp = 0
end
exports('removeInventoryHoldable', removeInventoryHoldable)

attachInventoryHoldable = function(item)
	if not item then return end

	local listEntry = props[item]
	if not listEntry then return end

	local ped = PlayerPedId()
	local bone = GetPedBoneIndex(ped, listEntry.boneId)
	loadModel(listEntry.model)
	currentEntities.inventoryHoldableProp = CreateObject(listEntry.model, GetEntityCoords(ped), true, true, true)
	AttachEntityToEntity(currentEntities.inventoryHoldableProp, ped, bone, listEntry.x, listEntry.y, listEntry.z, listEntry.rx, listEntry.ry, listEntry.rz, true, true, false, true, 1, true)
	SetModelAsNoLongerNeeded(model)
end
exports('attachInventoryHoldable', attachInventoryHoldable)