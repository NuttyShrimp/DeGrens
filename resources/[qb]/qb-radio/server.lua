DGCore.Functions.CreateUseableItem("radio", function(source, item)
    TriggerClientEvent('qb-radio:use', source)
end)

DGCore.Functions.CreateCallback('qb-radio:server:GetItem', function(source, cb, item)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player ~= nil then
        local RadioItem = Player.Functions.GetItemByName(item)
        if RadioItem ~= nil and not Player.PlayerData.metadata["isdead"] and
            not Player.PlayerData.metadata["inlaststand"] then
            cb(true)
        else
            cb(false)
        end
    else
        cb(false)
    end
end)

for channel, config in pairs(Config.RestrictedChannels) do
    exports['pma-voice']:addChannelCheck(channel, function(source)
        local Player = DGCore.Functions.GetPlayer(source)
        return config[Player.PlayerData.job.name] and Player.PlayerData.job.onduty
    end)
end
