DGCore.Functions.CreateCallback('dg-weapons:server:getAmmoConfig', function(src, cb)
    while not config do Wait(10) end
    cb(config.ammo)
end)

DGCore.Functions.CreateCallback('weapons:server:shouldHolster', function(source, cb, pWeaponHash)
  if not pWeaponHash then return end
  local shouldHolster = not Weapons[pWeaponHash].noHolstering
  cb(shouldHolster)
end)

DGCore.Functions.CreateCallback('weapons:server:GetAmmo', function(source, cb, pWeaponData)
  if not pWeaponData then return end

  local ammoCount = 0
  if Weapons[pWeaponData.hash].oneTimeUse then
    ammoCount = 1
  elseif Weapons[pWeaponData.hash].unlimitedAmmo then
    ammoCount = 9999
  else
    local itemData = DGX.Inventory.getItemStateById(pWeaponData.id)
    if itemData then
      ammoCount = tonumber(itemData.metadata.ammo or 1)
    end
  end

  cb(ammoCount)
end)

RegisterServerEvent('weapons:server:SetAmmo', function(pWeaponData, pAmmoCount)
  if not pWeaponData or not pAmmoCount then return end

  DGX.Inventory.setMetadataOfItem(pWeaponData.id, function(metadata)
    metadata.ammo = pAmmoCount
    return metadata
  end)
end)

RegisterServerEvent('weapons:server:ForceSetQuality', function(pWeaponData, pQuality)
  if not pWeaponData or not pQuality then return end

  DGX.Inventory.setQualityOfItem(pWeaponData.id, function()
    return pQuality
  end)
end)

RegisterServerEvent('weapons:server:StoppedShooting', function(pWeaponData, pAmmoCount, pQualityDecrease)
  if not pWeaponData or not pAmmoCount or not pQualityDecrease then return end

  local Player = DGCore.Functions.GetPlayer(source)

  if Weapons[pWeaponData.hash].oneTimeUse then
    DGX.Inventory.destroyItem(pWeaponData.id)
    return
  end

  local qualityDecrease = Weapons[pWeaponData.hash].durabilityMultiplier * pQualityDecrease
  DGX.Inventory.setQualityOfItem(pWeaponData.id, function(oldQuality)
    return oldQuality - qualityDecrease
  end)

  DGX.Inventory.setMetadataOfItem(pWeaponData.id, function(oldMetadata)
    oldMetadata.ammo = pAmmoCount
    return oldMetadata
  end)
end)

-- Attachments
RegisterServerEvent('weapons:server:AddAttachment', function(pWeaponData, pAttachmentId)
  if not pWeaponData or not pAttachmentId then return end

  local itemData = DGX.Inventory.getItemStateById(pAttachmentId)
  if not Weapons[pWeaponData.hash].attachments or not Weapons[pWeaponData.hash].attachments[itemData.name] then
    DGX.RPC.execute('dg-ui:client:addNotification', source, "Dit past niet op je wapen...", "error")
    return
  end

  local stashId = ('weapon_%s'):format(pWeaponData.metadata.serialnumber)
  local components = getEquipedWeaponComponents(pWeaponData.hash, stashId)
  local component = Weapons[pWeaponData.hash].attachments[itemData.name]

  if hasComponent(components, component) then

    DGX.RPC.execute('dg-ui:client:addNotification', source, "Je hebt dit al op je wapen...", "error")
    return
  end

  DGX.Inventory.moveItemToInventory('stash', stashId, itemData.id)
  components[#components+1] = component

  local allAttachmentsForWeapon = Weapons[pWeaponData.hash].attachments
  TriggerClientEvent('weapons:client:UpdateAttachments', source, allAttachmentsForWeapon, components)
end)

DGCore.Functions.CreateCallback('weapons:server:getAttachmentsOnWeapon', function(source, cb, pWeaponData)
  local stashId = ('weapon_%s'):format(pWeaponData.metadata.serialnumber)
  local components = getEquipedWeaponComponents(pWeaponData.hash, stashId)
  cb(components)
end)

DGCore.Functions.CreateCallback('weapons:server:GetAttachmentsMenuEntries', function(source, cb, pWeaponData)
  if not pWeaponData then return end

  local menu = {
    {
      title = 'Attachments',
      description = 'Selecteer een attachment om deze te verwijderen.',
    },
  }

  local stashId = ('weapon_%s'):format(pWeaponData.metadata.serialnumber)
  local components = getEquipedWeaponComponents(pWeaponData.hash, stashId)

  for _, component in pairs(components) do
    local attachmentName = getAttachmentNameFromWeaponComponent(pWeaponData.hash, component)
    menu[#menu + 1] = {
      title = DGX.Inventory.getItemData(attachmentName).label,
      icon = 'trash',
      callbackURL = 'weapons:client:RemoveAttachment',
      data = {
        name = attachmentName,
      }
    }
  end
  cb(menu)
end)

RegisterServerEvent('weapons:server:RemoveAttachment', function(pWeaponData, pAttachmentName)
  if not pWeaponData or not pAttachmentName then return end

  local stashId = ('weapon_%s'):format(pWeaponData.metadata.serialnumber)

  local itemData = DGX.Inventory.getFirstItemOfName('stash', stashId, pAttachmentName)
  local cid = DGCore.Functions.GetPlayer(source).PlayerData.citizenid
  DGX.Inventory.moveItemToInventory('player', cid, itemData.id)

  local allAttachmentsForWeapon = Weapons[pWeaponData.hash].attachments
  local components = getEquipedWeaponComponents(pWeaponData.hash, stashId)
  TriggerClientEvent('weapons:client:UpdateAttachments', source, allAttachmentsForWeapon, components)
end)

-- Tints
RegisterServerEvent('weapons:server:SetTint', function(pWeaponData, pTint)
  if not pWeaponData or not pTint then return end

  DGX.Inventory.setMetadataOfItem(pWeaponData.id, function(metadata)
    metadata.tint = pTint
    return metadata
  end)
end)

DGX.Inventory.onInventoryUpdate('player', function(identifier, action, itemState)
  local weaponData = Weapons[GetHashKey(itemState.name)]
  if not weaponData then return end
  if weaponData.oneTimeUse then return end -- One time use items get removed by themself because ammo is 0

	local src = DGCore.Functions.GetPlayerByCitizenId(tonumber(identifier)).PlayerData.source
  TriggerClientEvent('weapons:client:removedWeaponItem', src, itemState.id)
end, nil, 'remove')