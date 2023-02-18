-- key cid, value: time
local recentlyDroppedPlayers = {}

exports('addDroppedPlayer', function(cid)
  recentlyDroppedPlayers[cid] = true
  SetTimeout(5 * 60 * 1000, function()
    recentlyDroppedPlayers[cid] = nil
  end)
end)

getPlySpawns = function(src)
	local Spawns = {}

  local ply = DGCore.Functions.GetPlayer(src)

  -- Limit to prison if in prison
  if ply and ply.PlayerData.metadata.jailMonths ~= -1 then
    table.insert(Spawns, Config.Server.spawns.prison)
    return Spawns
  end

  local isDown = ply ~= nil and ply.PlayerData.metadata.downState ~= 'alive' or false
  local isDevEnv = DGX.Util.isDevEnv()
  local isDev = DGX.Admin.hasPermission(src, "developer")
  local recentlyDropped = recentlyDroppedPlayers[ply.PlayerData.citizenid] or false
  
  -- Only able to join at last location when one of following options is true
  -- isDevEnv
  -- is developer
  -- has recently dropped
  -- is dead
  if isDevEnv or isDev or recentlyDropped or isDown then
    if ply ~= nil then
      table.insert(Spawns, {
        label = "Laatste locatie",
        spawnType = 'world',
        position = {x = ply.PlayerData.position.x, y = ply.PlayerData.position.y, z = ply.PlayerData.position.z, w = 0},
      })
    end
  end

  -- If dead then limit to last position
  if isDown then 
    return Spawns
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
	-- local houses = exports['qb-houses']:getOwnedHouses(src)
	-- for _, v in pairs(houses) do
	-- 	table.insert(Spawns, {
	-- 		label = v.label,
	-- 		spawnType = 'house',
	-- 		position = v.coords,
	-- 		houseIdx = v.house
	-- 	})
	-- end
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
		SetEntityCoords(ped, pos.x, pos.y, pos.z, false, false, false, false)
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