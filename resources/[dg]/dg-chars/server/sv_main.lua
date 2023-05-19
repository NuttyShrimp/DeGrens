userModule = nil
charModule = nil

Citizen.CreateThread(function()
  userModule = DGX.Core.getModule('users')
  charModule = DGX.Core.getModule('characters')
end)

DGX.Util.onCharSpawn(function(plyId, isNewCharacter)
  if not isNewCharacter then return end

  DGX.Inventory.giveStarterItems(plyId)
  exports['dg-apartments']:enterApartment(plyId)
end)

AddEventHandler("core:modules:started", function()
  userModule = DGX.Core.getModule("users")
  charModule = DGX.Core.getModule("characters")
end)

DGX.RPC.register('dg-chars:server:setupClient', function(source)
  -- Give the client time to create all polyzones
  Wait(1000)
  local instanceId = 1000 +
      source -- This instead of the getfreeinstance shit that did not work, no one will ever see eachother by using serverid
  exports['dg-lib']:setInstance(source, instanceId)
  exports['dg-lib']:setInstanceName(instanceId, 'char-selection-' .. GetPlayerName(source))
end)

DGX.RPC.register('dg-chars:server:getChars', function(src)
  local steamid = userModule.getPlyIdentifiers(src).steam
  local chars = {}
  local result = exports['dg-sql']:query([[
		SELECT p.citizenid, p.firstname, p.lastname, ps.model, ps.skin
		FROM all_character_data p
			INNER JOIN playerskins ps on p.citizenid = ps.citizenid AND ps.active = 1
    WHERE steamid = ?
	]], { steamid })
  for k, v in ipairs(result) do
    v.model = tonumber(v.model)
    chars[k] = v
  end
  return chars
end)

DGX.RPC.register('dg-chars:server:deleteCharacter', function(src, cid)
  charModule.deleteCharacter(src, cid)
end)

DGX.RPC.register('dg-chars:server:loadPly', function(src, cid)
  if charModule.selectCharacter(src, cid) then
    -- TODO: replace with a colored logger
    print(('%s (Citizen ID: %s) has successfully been loaded!'):format(GetPlayerName(src), cid))
    exports['dg-chat']:refreshCommands(src)
    -- loadHouseData()
    DGX.Util.Log('chars:select', { citizenid = cid }, ("%s (%d | %d) loaded"):format(DGX.Util.getName(src), cid, src),
      src)
  end

  local ply = charModule.getPlayer(src)
  return ply
end)

DGX.RPC.register('dg-chars:server:createCharacter', function(src, data)
  if charModule.createCharacter(src, data) then
    -- TODO: replace with a colored logger
    print(('%s is creating a new character!'):format(GetPlayerName(src)))
    exports['dg-chat']:refreshCommands(src)
    DGX.Util.Log('chars:created', { data = data },
      ("%s (%d) is creating a new character (%s %s)"):format(DGX.Util.getName(plyId), src, data.firstname, data.lastname),
      src)
    TriggerClientEvent('qb-clothes:client:CreateFirstCharacter', src, data.gender)
  end
end)

local logOut = function(plyId)
  charModule.logout(plyId)
  TriggerClientEvent('chars:client:logOut', plyId)
  DGX.Util.Log('chars:logout', { plyId }, ('%s has logged out to switch characters'):format(DGX.Util.getName(plyId)))
end
exports('logOut', logOut)

DGX.Events.onNet('chars:server:logOut', function(src)
  logOut(src)
end)