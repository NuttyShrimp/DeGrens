local currentEntities = {
	phoneProp = 0,
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

	local hash = GetHashKey(listEntry.model)
	local ped = PlayerPedId()
	-- SetCurrentPedWeapon(ped, `weapon_unarmed`)
	local bone = GetPedBoneIndex(ped, listEntry.boneId)
	RequestModel(hash)
	while not HasModelLoaded(hash) do Wait(0) end
	removePhoneItem()
	currentEntities.phoneProp = CreateObject(hash, GetEntityCoords(ped), 1, 1, 0)
	AttachEntityToEntity(currentEntities.phoneProp, ped, bone, listEntry.x, listEntry.y, listEntry.z, listEntry.rx, listEntry.ry, listEntry.rz, 1, 1, 0, 1, 1.0, 1)
end
exports('attachPhoneItem', attachPhoneItem)
