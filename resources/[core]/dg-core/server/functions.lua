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
		if DGCore.Players[src].PlayerData.citizenid == citizenid then
			return DGCore.Players[src]
		end
	end
	return nil
end

function DGCore.Functions.GetPlayerByPhone(number)
	for src, player in pairs(DGCore.Players) do
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

-- Functions for getting data of offline players
function DGCore.Functions.GetOfflinePlayerByCitizenId(citizenid)
	-- Check if player is online
	local Player = DGCore.Functions.GetPlayerByCitizenId(citizenid)
	if Player then
		return Player
	end
	local query = [[
    SELECT * FROM all_character_data WHERE citizenid = ?
  ]]
	local result = exports['dg-sql']:query(query, { citizenid })
	if result and result[1] then
		return {
			PlayerData = DGCore.Player.buildPlayerData(result[1])
		}
	end
	return nil
end

-- Returns player server ids in given radius
function DGCore.Functions.GetPlayersInRadius(src, radius)
	radius = radius or 5
	local plyPed = GetPlayerPed(src)
	local plyPos = GetEntityCoords(plyPed)
	local closePlayers = {}
	for _, id in ipairs(DGCore.Functions.GetPlayers()) do
		if id == src then
			goto continue
		end
		local targetPed = GetPlayerPed(id)
		local targetPos = GetEntityCoords(targetPed)
		local distance = #(targetPos - plyPos)
		if distance <= radius then
			closePlayers[#closePlayers + 1] = id
		end
		:: continue ::
	end
	return closePlayers
end

-- Will return an array of QB Player class instances
-- unlike the GetPlayers() wrapper which only returns IDs
function DGCore.Functions.GetQBPlayers()
	return DGCore.Players
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

-- Setting & Removing Permissions

function DGCore.Functions.AddPermission(source, permission)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	local pSteamid = Player.PlayerData.steamid
	if Player then
		DGCore.Config.Server.PermissionList[pSteamid] = {
			steamid = pSteamid,
			permission = permission:lower(),
		}
		exports['dg-sql']:query('DELETE FROM permissions WHERE steamid = ?', { pSteamid })

		exports['dg-sql']:insert('INSERT INTO permissions (name, steamid, permission) VALUES (?, ?, ?)', {
			GetPlayerName(src),
			pSteamid,
			permission:lower()
		})

		Player.Functions.UpdatePlayerData()
		TriggerClientEvent('DGCore:Client:OnPermissionUpdate', src, permission)
	end
end

function DGCore.Functions.RemovePermission(source)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	local steamId = Player.PlayerData.steamid
	if Player then
		DGCore.Config.Server.PermissionList[steamId] = nil
		exports['dg-sql']:query('DELETE FROM permissions WHERE steamid = ?', { steamId })
		Player.Functions.UpdatePlayerData()
	end
end

-- Checking for Permission Level

function DGCore.Functions.GetPermission(source)
	return 'god'
end

-- Opt in or out of admin reports

function DGCore.Functions.IsOptin(source)
	local src = source
	local pSteamId = DGCore.Functions.GetIdentifier(src, 'steam')
	if exports['dg-admin']:hasPlayerPermission(src, 'staff') then
		retval = DGCore.Config.Server.PermissionList[pSteamId].optin
		return retval
	end
	return false
end

function DGCore.Functions.ToggleOptin(source)
	local src = source
	local pSteamId = DGCore.Functions.GetIdentifier(src, 'steam')
	if exports['dg-admin']:hasPlayerPermission(src, 'staff') then
		DGCore.Config.Server.PermissionList[pSteamId].optin = not DGCore.Config.Server.PermissionList[pSteamId].optin
	end
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
