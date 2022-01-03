DGCore.Functions = {}

-- Getters
-- Get your player first and then trigger a function on them
-- ex: local player = DGCore.Functions.GetPlayer(source)
-- ex: local example = player.Functions.functionname(parameter)

function DGCore.Functions.GetCoords(entity)
    local coords = GetEntityCoords(entity, false)
    local heading = GetEntityHeading(entity)
    return vector4(coords.x, coords.y, coords.z, heading)
end

function DGCore.Functions.GetIdentifier(source, idtype)
    local src = source
    local idtype = idtype or QBConfig.IdentifierType
    for _, identifier in pairs(GetPlayerIdentifiers(src)) do
        if string.find(identifier, idtype) then
            return identifier
        end
    end
    return nil
end

function DGCore.Functions.GetSource(identifier)
    for src, player in pairs(DGCore.Players) do
        local idens = GetPlayerIdentifiers(src)
        for _, id in pairs(idens) do
            if identifier == id then
                return src
            end
        end
    end
    return 0
end

function DGCore.Functions.GetPlayer(source)
    local src = source
    if type(src) == 'number' then
        return DGCore.Players[src]
    else
        return DGCore.Players[DGCore.Functions.GetSource(src)]
    end
end

function DGCore.Functions.GetPlayerByCitizenId(citizenid)
    for src, player in pairs(DGCore.Players) do
        local cid = citizenid
        if DGCore.Players[src].PlayerData.citizenid == cid then
            return DGCore.Players[src]
        end
    end
    return nil
end

function DGCore.Functions.GetPlayerByPhone(number)
    for src, player in pairs(DGCore.Players) do
        local cid = citizenid
        if DGCore.Players[src].PlayerData.charinfo.phone == number then
            return DGCore.Players[src]
        end
    end
    return nil
end

function DGCore.Functions.GetPlayers()
    local sources = {}
    for k, v in pairs(DGCore.Players) do
        table.insert(sources, k)
    end
    return sources
end

-- Returns player server ids in given radius
function DGCore.Functions.GetPlayersInRadius(src, radius)
	radius = radius or 5
	local plyPed = GetPlayerPed(src)
	local plyPos = GetEntityCoords(plyPed)
	local closePlayers = {}
	for _,id in ipairs(DGCore.Functions.GetPlayers()) do
		if id == src then goto continue end
		local targetPed = GetPlayerPed(id)
		local targetPos = GetEntityCoords(targetPed)
		local distance = #(targetPos - plyPos)
		if distance <= radius then
			closePlayers[#closePlayers + 1] = id
		end
		::continue::
	end
	return closePlayers
end

-- Will return an array of QB Player class instances
-- unlike the GetPlayers() wrapper which only returns IDs
function DGCore.Functions.GetQBPlayers()
    return DGCore.Players
end
-- Paychecks (standalone - don't touch)

function PaycheckLoop()
    local Players = DGCore.Functions.GetPlayers()
    for i = 1, #Players, 1 do
        local Player = DGCore.Functions.GetPlayer(Players[i])
        if Player.PlayerData.job and Player.PlayerData.job.onduty and Player.PlayerData.job.payment > 0 then
            Player.Functions.AddMoney('bank', Player.PlayerData.job.payment)
            TriggerClientEvent('DGCore:Notify', Players[i], 'You received your paycheck of $' .. Player.PlayerData.job.payment)
        end
    end
    SetTimeout(DGCore.Config.Money.PayCheckTimeOut * (60 * 1000), PaycheckLoop)
end

-- Callbacks

function DGCore.Functions.CreateCallback(name, cb)
    DGCore.ServerCallbacks[name] = cb
end

function DGCore.Functions.TriggerCallback(name, source, cb, ...)
    local src = source
    if DGCore.ServerCallbacks[name] then
        DGCore.ServerCallbacks[name](src, cb, ...)
    end
end

-- Items

function DGCore.Functions.CreateUseableItem(item, cb)
    DGCore.UseableItems[item] = cb
end

function DGCore.Functions.CanUseItem(item)
    return DGCore.UseableItems[item]
end

function DGCore.Functions.UseItem(source, item)
    local src = source
    DGCore.UseableItems[item.name](src, item)
end

-- Kick Player

function DGCore.Functions.Kick(source, reason, setKickReason, deferrals)
    local src = source
    reason = '\n' .. reason .. '\n🔸 Check our Discord for further information: ' .. DGCore.Config.Server.discord
    if setKickReason then
        setKickReason(reason)
    end
    CreateThread(function()
        if deferrals then
            deferrals.update(reason)
            Wait(2500)
        end
        if src then
            DropPlayer(src, reason)
        end
        local i = 0
        while (i <= 4) do
            i = i + 1
            while true do
                if src then
                    if (GetPlayerPing(src) >= 0) then
                        break
                    end
                    Wait(100)
                    CreateThread(function()
                        DropPlayer(src, reason)
                    end)
                end
            end
            Wait(5000)
        end
    end)
end

-- Check if player is whitelisted (not used anywhere)

function DGCore.Functions.IsWhitelisted(source)
    local src = source
    local plicense = DGCore.Functions.GetIdentifier(src, 'license')
    local identifiers = GetPlayerIdentifiers(src)
    if DGCore.Config.Server.whitelist then
        local result = exports.oxmysql:executeSync('SELECT * FROM whitelist WHERE license = ?', { plicense })
        if result[1] then
            for _, id in pairs(identifiers) do
                if result[1].license == id then
                    return true
                end
            end
        end
    else
        return true
    end
    return false
end

-- Setting & Removing Permissions

function DGCore.Functions.AddPermission(source, permission)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local plicense = Player.PlayerData.license
    if Player then
        DGCore.Config.Server.PermissionList[plicense] = {
            license = plicense,
            permission = permission:lower(),
        }
        exports.oxmysql:execute('DELETE FROM permissions WHERE license = ?', { plicense })

        exports.oxmysql:insert('INSERT INTO permissions (name, license, permission) VALUES (?, ?, ?)', {
            GetPlayerName(src),
            plicense,
            permission:lower()
        })

        Player.Functions.UpdatePlayerData()
        TriggerClientEvent('DGCore:Client:OnPermissionUpdate', src, permission)
    end
end

function DGCore.Functions.RemovePermission(source)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local license = Player.PlayerData.license
    if Player then
        DGCore.Config.Server.PermissionList[license] = nil
        exports.oxmysql:execute('DELETE FROM permissions WHERE license = ?', { license })
        Player.Functions.UpdatePlayerData()
    end
end

-- Checking for Permission Level

function DGCore.Functions.HasPermission(source, permission)
    local src = source
    local license = DGCore.Functions.GetIdentifier(src, 'license')
    local permission = tostring(permission:lower())
    if permission == 'user' then
        return true
    else
        if DGCore.Config.Server.PermissionList[license] then
            if DGCore.Config.Server.PermissionList[license].license == license then
                if DGCore.Config.Server.PermissionList[license].permission == permission or DGCore.Config.Server.PermissionList[license].permission == 'god' then
                    return true
                end
            end
        end
    end
    return false
end

function DGCore.Functions.GetPermission(source)
    local src = source
    local license = DGCore.Functions.GetIdentifier(src, 'license')
    if license then
        if DGCore.Config.Server.PermissionList[license] then
            if DGCore.Config.Server.PermissionList[license].license == license then
                return DGCore.Config.Server.PermissionList[license].permission
            end
        end
    end
    return 'user'
end

-- Opt in or out of admin reports

function DGCore.Functions.IsOptin(source)
    local src = source
    local license = DGCore.Functions.GetIdentifier(src, 'license')
    if DGCore.Functions.HasPermission(src, 'admin') then
        retval = DGCore.Config.Server.PermissionList[license].optin
        return retval
    end
    return false
end

function DGCore.Functions.ToggleOptin(source)
    local src = source
    local license = DGCore.Functions.GetIdentifier(src, 'license')
    if DGCore.Functions.HasPermission(src, 'admin') then
        DGCore.Config.Server.PermissionList[license].optin = not DGCore.Config.Server.PermissionList[license].optin
    end
end

-- Check if player is banned

function DGCore.Functions.IsPlayerBanned(source)
    local src = source
    local retval = false
    local message = ''
    local plicense = DGCore.Functions.GetIdentifier(src, 'license')
    local result = exports.oxmysql:executeSync('SELECT * FROM bans WHERE license = ?', { plicense })
    if result[1] then
        if os.time() < result[1].expire then
            retval = true
            local timeTable = os.date('*t', tonumber(result.expire))
            message = 'You have been banned from the server:\n' .. result[1].reason .. '\nYour ban expires ' .. timeTable.day .. '/' .. timeTable.month .. '/' .. timeTable.year .. ' ' .. timeTable.hour .. ':' .. timeTable.min .. '\n'
        else
            exports.oxmysql:execute('DELETE FROM bans WHERE id = ?', { result[1].id })
        end
    end
    return retval, message
end

-- Check for duplicate license

function DGCore.Functions.IsLicenseInUse(license)
    local players = GetPlayers()
    for _, player in pairs(players) do
        local identifiers = GetPlayerIdentifiers(player)
        for _, id in pairs(identifiers) do
            if string.find(id, 'license') then
                local playerLicense = id
                if playerLicense == license then
                    return true
                end
            end
        end
    end
    return false
end
