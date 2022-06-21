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
    for k, _ in pairs(config.ammo) do
        DGCore.Functions.CreateUseableItem(k, function(source, item)
            local Player = DGCore.Functions.GetPlayer(source)
            if not Player.Functions.GetItemByName(item.name) then return end
            TriggerClientEvent('weapons:client:UseAmmo', source, item)
        end)
    end

    -- Attachments
    for _, itemName in pairs(config.attachments) do
        DGCore.Functions.CreateUseableItem(itemName, function(source, item)
            local Player = DGCore.Functions.GetPlayer(source)
            if not Player.Functions.GetItemByName(item.name) then return end
            TriggerClientEvent('weapons:client:UseAttachment', source, item.name)
        end)
    end
end)