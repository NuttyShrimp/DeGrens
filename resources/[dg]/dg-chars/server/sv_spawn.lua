local crashed = {}

exports('addCrashedPlayer', function (steamId)
  table.insert(crashed, steamId)
end)

getPlySpawns = function(src)
	local Spawns = {}

  local isDevEnv = DGX.Util.isDevEnv()
  local isDev = exports['dg-admin']:hasPermission(src, "developer")
  local hasCrashed = false
  local plySteamId = Player(src).state.steamId
  for _, crashedIds in pairs(crashed) do
    if crashedIds == plySteamId then
      hasCrashed = true
      break
    end
  end
  -- Only able to join at last location when one of following options is true
  -- isDevEnv
  -- is developer
  -- has crashed
  if isDevEnv or isDev or hasCrashed then
    local ply = DGCore.Functions.GetPlayer(src)
    if ply ~= nil then
      table.insert(Spawns, {
        label = "Laatste locatie",
        spawnType = 'world',
        position = ply.PlayerData.position,
      })
    end
  end

	for _, v in pairs(Config.Server.spawns.base) do
		if (v.isEnabled and not v.isEnabled()) then
			goto continue
		end
		table.insert(Spawns, {
			label = v.label,
			spawnType = v.spawnType,
			position = v.position,
		})
		::continue::
	end
	for job, spawns in pairs(Config.Server.spawns.job) do
    if DGX.Jobs.isWhitelisted(src, job) then
      for _, v in pairs(spawns) do
        if (v.isEnabled and not v.isEnabled()) then
          goto continue
        end
        table.insert(Spawns, {
          label = v.label,
          spawnType = v.spawnType,
          position = v.position,
        })
        ::continue::
      end
    end
  end
	local houses = exports['qb-houses']:getOwnedHouses(src)
	for _, v in pairs(houses) do
		table.insert(Spawns, {
			label = v.label,
			spawnType = 'house',
			position = v.coords,
			houseIdx = v.house
		})
	end
	return Spawns
end

DGCore.Functions.CreateCallback('dg-chars:server:getSpawns', function(src, cb)
	local Player = DGCore.Functions.GetPlayer(src)
	if not Player then
		cb('Kon speler niet vinden, rejoin de server.')
		return
	end
	local Spawns = getPlySpawns(src)
	cb(Spawns)
end)

DGCore.Functions.CreateCallback('dg-chars:server:spawn', function(src, cb, idx)
	local spawn = getPlySpawns(src)[idx]
	if not spawn then
		cb('Kon spawn niet vinden, probeer opnieuw of rejoin de server.')
		return
	end
	local ped = GetPlayerPed(src)
	local setPosition = function(pos)
		SetEntityCoords(ped, pos)
		SetEntityHeading(ped, pos.w)
	end
  exports['dg-lib']:setInstance(src, 0)
	if spawn.spawnType == 'world' then
		setPosition(spawn.position)
		cb({
			resetPed = true,
			resetInside = true,
      fade = true,
		})
	elseif spawn.spawnType == 'house' then
		cb({
			resetPed = true,
		})
		TriggerClientEvent('qb-houses:client:enterOwnedHouse', src, spawn.houseIdx)
	elseif spawn.spawnType == 'apartment' then
		cb({
			resetPed = true,
			resetInside = true,
		})
		exports['dg-apartments']:enterApartment(src)
	end
	cb({})
	TriggerClientEvent('dg-chars:client:finishSpawn', src)
end)