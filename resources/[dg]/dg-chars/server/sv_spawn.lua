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

  local ply = charModule.getPlayer(src)

  -- Limit to prison if in prison
  if ply and ply.metadata.jailMonths ~= -1 then
    table.insert(Spawns, Config.Server.spawns.prison)
    return Spawns
  end

  local isDown = ply ~= nil and ply.metadata.downState ~= 'alive' or false
  local isDevEnv = DGX.Util.isDevEnv()
  local isDev = DGX.Admin.hasPermission(src, "developer")
  local recentlyDropped = recentlyDroppedPlayers[ply.citizenid] or false

  -- Only able to join at last location when one of following options is true
  -- isDevEnv
  -- is developer
  -- has recently dropped
  -- is dead
  if isDevEnv or isDev or recentlyDropped or isDown then
    if ply ~= nil and vector3(ply.position.x, ply.position.y, ply.position.z) ~= vector3(0,0,0) then
      table.insert(Spawns, {
        label = "Laatste locatie",
        spawnType = 'world',
        position = { x = ply.position.x, y = ply.position.y, z = ply.position.z, w = 0 },
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

DGX.RPC.register('dg-chars:server:getSpawns', function(src)
  local Player = charModule.getPlayer(src)
  if not Player then
    return 'Kon speler niet vinden, rejoin de server.'
  end
  local Spawns = getPlySpawns(src)
  return Spawns
end)

DGX.RPC.register('dg-chars:server:spawn', function(src, idx)
  local Player = charModule.getPlayer(src)
  local spawn = getPlySpawns(src)[idx]
  if not spawn then
    return 'Kon spawn niet vinden, probeer opnieuw of rejoin de server.'
  end
  local ped = GetPlayerPed(src)
  local setPosition = function(pos)
    SetEntityCoords(ped, pos.x, pos.y, pos.z, false, false, false, false)
    SetEntityHeading(ped, pos.w)
  end
  exports['dg-lib']:setInstance(src, 0)
  local returnOptions = {}
  if spawn.spawnType == 'world' then
    setPosition(spawn.position)
    returnOptions = {
      resetPed = true,
      resetInside = true,
      fade = true,
    }
  elseif spawn.spawnType == 'house' then
    TriggerClientEvent('qb-houses:client:enterOwnedHouse', src, spawn.houseIdx)
    returnOptions = {
      resetPed = true,
    }
  elseif spawn.spawnType == 'apartment' then
    exports['dg-apartments']:enterApartment(src)
    returnOptions = {
      resetPed = true,
      resetInside = true,
    }
  end
  DGX.Util.Log("chars:spawn", { spawn = spawn }, ("%s(%d) has spawned at %s"):format(DGX.Util.getName(src), Player.citizenid, spawn.label), src)
  TriggerClientEvent('dg-chars:client:finishSpawn', src, false)
  return returnOptions
end)