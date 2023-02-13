DGCore.Functions = {}

-- Getters
-- Get your player first and then trigger a function on them
-- ex: local player = DGCore.Functions.GetPlayer(source)
-- ex: local example = player.Functions.functionname(parameter)

function DGCore.Functions.GetIdentifier(source, idtype)
	local src = source
	local idtype = idtype or DGConfig.IdentifierType
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

function DGCore.Functions.getPlyIdForCid(citizenid)
  return DGCore.cidToPlyId[citizenid]
end

function DGCore.Functions.GetPlayerByCitizenId(citizenid)
  local plyId = DGCore.Functions.getPlyIdForCid(citizenid)
  if not plyId then return nil end
  return DGCore.Players[plyId]
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
	for k, _ in pairs(DGCore.Players) do
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

function DGCore.Functions.GetOfflinePlayerByPhone(number)
	-- Check if player is online
	local player = DGCore.Functions.GetPlayerByPhone(number)
	if player then return player end
	local query = [[
    SELECT * FROM all_character_data WHERE phone = ?
  ]]
	local result = exports['dg-sql']:query(query, { number })
	if result and result[1] then
		return {
			PlayerData = DGCore.Player.buildPlayerData(result[1])
		}
	end
	return nil
end

function DGCore.Functions.GetCidsForSteamId(steamId)
  local query = [[
    SELECT citizenid from characters where steamid = ?
  ]]

	local result = exports['dg-sql']:query(query, { steamId })
	return result
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

function DGCore.Functions.GetClosestVehicle(src)
  local vehNetId = DGX.RPC.execute('core:functions:getClosestVehicle', src)
  if (not vehNetId or vehNetId < 0) then
    return 0
  end
  return NetworkGetEntityFromNetworkId(vehNetId)
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