hasComponent = function(pComponents, pComponent)
    for k, v in pairs(pComponents) do
        if v == pComponent then
            return k
        end
    end
    return false
end

getAttachmentNameFromWeaponComponent = function(pWeaponHash, pComponent)
    for name, component in pairs(Weapons[pWeaponHash].attachments) do
        if component == pComponent then
            return name
        end
    end
    return nil
end

getEquipedWeaponComponents = function(hash, stashId)
  local allPossibleAttachments = Weapons[hash].attachments
  local attachmentsOnWeapon = DGX.Inventory.getItemsInInventory('stash', stashId)
  local components = {}
  for _, attachment in pairs(attachmentsOnWeapon) do
    components[#components+1] = allPossibleAttachments[attachment.name]
  end
  return components
end