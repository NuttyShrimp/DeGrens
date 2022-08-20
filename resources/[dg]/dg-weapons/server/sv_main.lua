config = nil
Citizen.CreateThread(function()
    while not exports['dg-config']:areConfigsReady() do Wait(10) end
    config = exports['dg-config']:getModuleConfig('weapons')

    exports['dg-chat']:registerCommand('setweaponquality', 'Zet Wapen HP (Admin Only)', {{name='hp', description='HP van wapen'}}, 'admin', function(source, command, args)
        local quality = tonumber(args[1])
        TriggerClientEvent('weapons:client:ForceSetQuality', source, quality)
    end)

    exports['dg-chat']:registerCommand('setammo', 'Zet ammo hoeveelheid (Admin Only)', {{name='amount', description='Aantal, bv: 20'}}, 'admin', function(source, command, args)
        local amount = tonumber(args[1])
        TriggerClientEvent('weapons:client:ForceSetAmmo', source, amount)
    end)

    exports['dg-chat']:registerCommand('attachments', 'Interacties voor je wapen attachments', {}, 'user', function(source, command, args)
        TriggerClientEvent('weapons:client:OpenAttachmentMenu', source)
    end)
    
    -- Ammo
    local ammoNames = {}
    for itemName, _ in pairs(config.ammo) do
        ammoNames[#ammoNames+1] = itemName
    end
    DGX.Inventory.registerUseable(ammoNames, function(src, item)
        TriggerClientEvent('weapons:client:UseAmmo', src, item.name)
    end)

    -- Attachments
    local attachmentNames = {}
    for _, itemName in pairs(config.attachments) do
        attachmentNames[#attachmentNames+1] = itemName
    end
    DGX.Inventory.registerUseable(attachmentNames, function(src, item)
        TriggerClientEvent('weapons:client:UseAttachment', src, item.id)
    end)

    -- Weapons
    local weaponNames = {}
    for _, data in pairs(Weapons) do
      weaponNames[#weaponNames+1] = data.name
    end
    DGX.Inventory.registerUseable(weaponNames, function(src, item)
      local weaponData = item
      weaponData.hash = GetHashKey(item.name)
      weaponData.isOneTimeUse = Weapons[weaponData.hash].oneTimeUse or false
      TriggerClientEvent('weapons:client:UseWeapon', src, weaponData)
  end)
end)