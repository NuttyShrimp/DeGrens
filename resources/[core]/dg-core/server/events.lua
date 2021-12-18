-- Event Handler

AddEventHandler('playerDropped', function()
    local src = source
    if DGCore.Players[src] then
        local Player = DGCore.Players[src]
        TriggerEvent('qb-log:server:CreateLog', 'joinleave', 'Dropped', 'red', '**' .. GetPlayerName(src) .. '** (' .. Player.PlayerData.license .. ') left..')
        Player.Functions.Save()
        DGCore.Players[src] = nil
    end
end)

AddEventHandler('chatMessage', function(source, n, message)
    local src = source
    if string.sub(message, 1, 1) == '/' then
        local args = DGCore.Shared.SplitStr(message, ' ')
        local command = string.gsub(args[1]:lower(), '/', '')
        CancelEvent()
        if DGCore.Commands.List[command] then
            local Player = DGCore.Functions.GetPlayer(src)
            if Player then
                local isGod = DGCore.Functions.HasPermission(src, 'god')
                local hasPerm = DGCore.Functions.HasPermission(src, DGCore.Commands.List[command].permission)
                local isPrincipal = IsPlayerAceAllowed(src, 'command')
                table.remove(args, 1)
                if isGod or hasPerm or isPrincipal then
                    if (DGCore.Commands.List[command].argsrequired and #DGCore.Commands.List[command].arguments ~= 0 and args[#DGCore.Commands.List[command].arguments] == nil) then
                        TriggerClientEvent('DGCore:Notify', src, 'All arguments must be filled out!', 'error')
                    else
                        DGCore.Commands.List[command].callback(src, args)
                    end
                else
                    TriggerClientEvent('DGCore:Notify', src, 'No Access To This Command', 'error')
                end
            end
        end
    end
end)

-- Player Connecting

local function OnPlayerConnecting(name, setKickReason, deferrals)
    local player = source
    local license
    local identifiers = GetPlayerIdentifiers(player)
    deferrals.defer()

    -- mandatory wait!
    Wait(0)

    deferrals.update(string.format('Hello %s. Validating Your Rockstar License', name))

    for _, v in pairs(identifiers) do
        if string.find(v, 'license') then
            license = v
            break
        end
    end

    -- mandatory wait!
    Wait(2500)

    deferrals.update(string.format('Hello %s. We are checking if you are banned.', name))

    local isBanned, Reason = DGCore.Functions.IsPlayerBanned(player)
    local isLicenseAlreadyInUse = DGCore.Functions.IsLicenseInUse(license)

    Wait(2500)

    deferrals.update(string.format('Welcome %s to {Server Name}.', name))

    if not license then
        deferrals.done('No Valid Rockstar License Found')
    elseif isBanned then
        deferrals.done(Reason)
    elseif isLicenseAlreadyInUse then
        deferrals.done('Duplicate Rockstar License Found')
    else
        deferrals.done()
        Wait(1000)
        TriggerEvent('connectqueue:playerConnect', name, setKickReason, deferrals)
    end
    --Add any additional defferals you may need!
end

AddEventHandler('playerConnecting', OnPlayerConnecting)

-- Open & Close Server (prevents players from joining)

RegisterNetEvent('DGCore:server:CloseServer', function(reason)
    local src = source
    if DGCore.Functions.HasPermission(src, 'admin') or DGCore.Functions.HasPermission(src, 'god') then
        local reason = reason or 'No reason specified'
        DGCore.Config.Server.closed = true
        DGCore.Config.Server.closedReason = reason
        TriggerClientEvent('qbadmin:client:SetServerStatus', -1, true)
    else
        DGCore.Functions.Kick(src, 'You don\'t have permissions for this..', nil, nil)
    end
end)

RegisterNetEvent('DGCore:server:OpenServer', function()
    local src = source
    if DGCore.Functions.HasPermission(src, 'admin') or DGCore.Functions.HasPermission(src, 'god') then
        DGCore.Config.Server.closed = false
        TriggerClientEvent('qbadmin:client:SetServerStatus', -1, false)
    else
        DGCore.Functions.Kick(src, 'You don\'t have permissions for this..', nil, nil)
    end
end)

-- Callbacks

RegisterNetEvent('DGCore:Server:TriggerCallback', function(name, ...)
    local src = source
    DGCore.Functions.TriggerCallback(name, src, function(...)
        TriggerClientEvent('DGCore:Client:TriggerCallback', src, name, ...)
    end, ...)
end)

RegisterNetEvent('DGCore:server:TriggerPromiseCallback', function(name, callId, ...)
	local src = source
	DGCore.Functions.TriggerCallback(name, src, function(...)
		TriggerClientEvent('DGCore:Client:TriggerPromiseCallback', src, callId, ...)
	end, ...)
end)

-- Player

RegisterNetEvent('DGCore:UpdatePlayer', function()
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player then
        local newHunger = Player.PlayerData.metadata['hunger'] - DGCore.Config.Player.HungerRate
        local newThirst = Player.PlayerData.metadata['thirst'] - DGCore.Config.Player.ThirstRate
        if newHunger <= 0 then
            newHunger = 0
        end
        if newThirst <= 0 then
            newThirst = 0
        end
        Player.Functions.SetMetaData('thirst', newThirst)
        Player.Functions.SetMetaData('hunger', newHunger)
        TriggerClientEvent('hud:client:UpdateNeeds', src, newHunger, newThirst)
        Player.Functions.Save()
    end
end)

RegisterNetEvent('DGCore:Server:SetMetaData', function(meta, data)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if meta == 'hunger' or meta == 'thirst' then
        if data > 100 then
            data = 100
        end
    end
    if Player then
        Player.Functions.SetMetaData(meta, data)
    end
    TriggerClientEvent('hud:client:UpdateNeeds', src, Player.PlayerData.metadata['hunger'], Player.PlayerData.metadata['thirst'])
end)

RegisterNetEvent('DGCore:ToggleDuty', function()
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.PlayerData.job.onduty then
        Player.Functions.SetJobDuty(false)
        TriggerClientEvent('DGCore:Notify', src, 'You are now off duty!')
    else
        Player.Functions.SetJobDuty(true)
        TriggerClientEvent('DGCore:Notify', src, 'You are now on duty!')
    end
    TriggerClientEvent('DGCore:Client:SetDuty', src, Player.PlayerData.job.onduty)
end)

-- Items

RegisterNetEvent('DGCore:Server:UseItem', function(item)
    local src = source
    if item and item.amount > 0 then
        if DGCore.Functions.CanUseItem(item.name) then
            DGCore.Functions.UseItem(src, item)
        end
    end
end)

RegisterNetEvent('DGCore:Server:RemoveItem', function(itemName, amount, slot)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    Player.Functions.RemoveItem(itemName, amount, slot)
end)

RegisterNetEvent('DGCore:Server:AddItem', function(itemName, amount, slot, info, quality)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    Player.Functions.AddItem(itemName, amount, slot, info, quality)
end)

-- Non-Chat Command Calling (ex: qb-adminmenu)

RegisterNetEvent('DGCore:CallCommand', function(command, args)
    local src = source
    if DGCore.Commands.List[command] then
        local Player = DGCore.Functions.GetPlayer(src)
        if Player then
            local isGod = DGCore.Functions.HasPermission(src, 'god')
            local hasPerm = DGCore.Functions.HasPermission(src, DGCore.Commands.List[command].permission)
            local isPrincipal = IsPlayerAceAllowed(src, 'command')
            if (DGCore.Commands.List[command].permission == Player.PlayerData.job.name) or isGod or hasPerm or isPrincipal then
                if (DGCore.Commands.List[command].argsrequired and #DGCore.Commands.List[command].arguments ~= 0 and args[#DGCore.Commands.List[command].arguments] == nil) then
                    TriggerClientEvent('DGCore:Notify', src, 'All arguments must be filled out!', 'error')
                else
                    DGCore.Commands.List[command].callback(src, args)
                end
            else
                TriggerClientEvent('DGCore:Notify', src, 'No Access To This Command', 'error')
            end
        end
    end
end)

-- Has Item Callback (can also use client function - DGCore.Functions.HasItem(item))

DGCore.Functions.CreateCallback('DGCore:HasItem', function(source, cb, items, amount)
    local src = source
    local retval = false
    local Player = DGCore.Functions.GetPlayer(src)
    if Player then
        if type(items) == 'table' then
            local count = 0
            local finalcount = 0
            for k, v in pairs(items) do
                if type(k) == 'string' then
                    finalcount = 0
                    for i, _ in pairs(items) do
                        if i then
                            finalcount = finalcount + 1
                        end
                    end
                    local item = Player.Functions.GetItemByName(k)
                    if item then
                        if item.amount >= v then
                            count = count + 1
                            if count == finalcount then
                                retval = true
                            end
                        end
                    end
                else
                    finalcount = #items
                    local item = Player.Functions.GetItemByName(v)
                    if item then
                        if amount then
                            if item.amount >= amount then
                                count = count + 1
                                if count == finalcount then
                                    retval = true
                                end
                            end
                        else
                            count = count + 1
                            if count == finalcount then
                                retval = true
                            end
                        end
                    end
                end
            end
        else
            local item = Player.Functions.GetItemByName(items)
            if item then
                if amount then
                    if item.amount >= amount then
                        retval = true
                    end
                else
                    retval = true
                end
            end
        end
    end
    cb(retval)
end)