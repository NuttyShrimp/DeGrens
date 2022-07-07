getPlySpawns = function(src)
	local Spawns = {}
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