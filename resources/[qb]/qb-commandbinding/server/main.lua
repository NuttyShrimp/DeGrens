DGCore.Commands.Add("binds", "Open commandbinding menu", {}, false, function(source, args)
    local Player = DGCore.Functions.GetPlayer(source)
	TriggerClientEvent("qb-commandbinding:client:openUI", source)
end)

RegisterServerEvent('qb-commandbinding:server:setKeyMeta')
AddEventHandler('qb-commandbinding:server:setKeyMeta', function(keyMeta)
    local src = source
    local ply = DGCore.Functions.GetPlayer(src)

    ply.Functions.SetMetaData("commandbinds", keyMeta)
end)