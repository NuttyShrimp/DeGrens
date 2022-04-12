local attachedEntities = {}

RegisterNetEvent('onResourceStop', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    for _, v in pairs(attachedEntities) do
        if DoesEntityExist(v) then
            DeleteEntity(v)
        end
    end
end)

addItem = function(item)
	if not item then 
        print(("[%s] Tried to attach item without providing itemname."):format(GetCurrentResourceName()))
        return 
    end

	local listEntry = props[item]
	if not listEntry then 
        print(("[%s] Tried to attach unregistered item with name: %s."):format(GetCurrentResourceName(), item))
        return 
    end

    -- we remove the item to avoid duplicate entities
    if attachedEntities[item] then
        removeItem(item) 
    end
    
    removeUniqueItems(item) -- remove items that cant coexist
    TriggerEvent("weapons:client:RemoveWeapon") -- we dont allow holding a weapon while having a prop attached to you

	local ped = PlayerPedId()
    local pos = GetEntityCoords(ped)
	local bone = GetPedBoneIndex(ped, listEntry.boneId)
    loadModel(listEntry.model)
	attachedEntities[item] = CreateObject(listEntry.model, pos, 1, 1, 0)
	AttachEntityToEntity(attachedEntities[item], ped, bone, listEntry.x, listEntry.y, listEntry.z, listEntry.rx, listEntry.ry, listEntry.rz, 1, 1, 0, 0, 2, 1)
    SetModelAsNoLongerNeeded(listEntry.Model)
end
exports('addItem', addItem)

removeItem = function(item)
    if not item then 
        print(("[%s] Tried to remove item without providing itemname."):format(GetCurrentResourceName()))
        return 
    end

	if not attachedEntities[item] then 
        debug(("[%s] Tried to remove unattached item with name: %s."):format(GetCurrentResourceName(), item))
        return 
    end

	DeleteEntity(attachedEntities[item])
	attachedEntities[item] = nil
end
exports('removeItem', removeItem)

removeUniqueItems = function(item)
    for _, itemGroup in pairs(uniqueItems) do
        local checkUniques = false
        for _, v in pairs(itemGroup) do
            if v == item then
                checkUniques = true
                break
            end
        end

        if checkUniques then
            for _, v in pairs(itemGroup) do
                if v ~= item then
                    removeItem(v)
                end
            end
        end
    end
end


