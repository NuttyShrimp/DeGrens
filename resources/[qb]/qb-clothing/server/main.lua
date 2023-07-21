local charModule = exports['dg-core']:getModule('characters')

RegisterServerEvent("qb-clothing:saveSkin")
AddEventHandler('qb-clothing:saveSkin', function(model, skin)
  local src = source
  local Player = charModule.getPlayer(src)
  if model ~= nil and skin ~= nil then
    -- TODO: Update primary key to be citizenid so this can be an insert on duplicate update query
    skinCount = exports['dg-sql']:query("SELECT COUNT(*) AS skinCount FROM playerskins WHERE citizenid = ?",
      { Player.citizenid })
    if #skinCount > 0 and skinCount[1].skinCount and skinCount[1].skinCount > 0 then
      exports['dg-sql']:query('DELETE FROM playerskins WHERE citizenid = ?', { Player.citizenid })
    end
    exports['dg-sql']:query('INSERT INTO playerskins (citizenid, model, skin, active) VALUES (?, ?, ?, ?)', {
      Player.citizenid,
      model,
      skin,
      1
    })
  end
end)

RegisterServerEvent("qb-clothes:loadPlayerSkin")
AddEventHandler('qb-clothes:loadPlayerSkin', function()
  local src = source
  local Player = charModule.getPlayer(src)
  local result = exports['dg-sql']:query('SELECT * FROM playerskins WHERE citizenid = ? AND active = ?',
    { Player.citizenid, 1 })
  if result[1] ~= nil then
    TriggerClientEvent("qb-clothes:loadSkin", src, false, result[1].model, result[1].skin)
  else
    TriggerClientEvent("qb-clothes:loadSkin", src, true)
  end
end)

RegisterServerEvent("qb-clothes:saveOutfit")
AddEventHandler("qb-clothes:saveOutfit", function(outfitName, model, skinData)
  local src = source
  local Player = charModule.getPlayer(src)
  if model ~= nil and skinData ~= nil then
    local outfitId = "outfit-" .. math.random(1, 10) .. "-" .. math.random(1111, 9999)
    exports['dg-sql']:query(
      'INSERT INTO player_outfits (citizenid, outfitname, model, skin, outfitId) VALUES (?, ?, ?, ?, ?)', {
        Player.citizenid,
        outfitName,
        model,
        json.encode(skinData),
        outfitId
      }, function()
        local result = exports['dg-sql']:query('SELECT * FROM player_outfits WHERE citizenid = ?',
          { Player.citizenid })
        if result[1] ~= nil then
          TriggerClientEvent('qb-clothing:client:reloadOutfits', src, result)
        else
          TriggerClientEvent('qb-clothing:client:reloadOutfits', src, nil)
        end
      end)
  end
end)

RegisterServerEvent("qb-clothing:server:removeOutfit")
AddEventHandler("qb-clothing:server:removeOutfit", function(outfitName, outfitId)
  local src = source
  local Player = charModule.getPlayer(src)
  exports['dg-sql']:query('DELETE FROM player_outfits WHERE citizenid = ? AND outfitname = ? AND outfitId = ?', {
    Player.citizenid,
    outfitName,
    outfitId
  }, function()
    local result = exports['dg-sql']:query('SELECT * FROM player_outfits WHERE citizenid = ?',
      { Player.citizenid })
    if result[1] ~= nil then
      TriggerClientEvent('qb-clothing:client:reloadOutfits', src, result)
    else
      TriggerClientEvent('qb-clothing:client:reloadOutfits', src, nil)
    end
  end)
end)

DGX.RPC.register('qb-clothing:server:getOutfits', function(source)
  local src = source
  local Player = charModule.getPlayer(src)
  local anusVal = {}

  local result = exports['dg-sql']:query('SELECT * FROM player_outfits WHERE citizenid = ?',
    { Player.citizenid })
  if result[1] ~= nil then
    for k, v in pairs(result) do
      result[k].skin = json.decode(result[k].skin)
      anusVal[k] = v
    end
    return anusVal
  end
  return anusVal
end)

exports['dg-chat']:registerCommand("helm", "Zet je helm op", {}, 'user', function(source)
  TriggerClientEvent("clothing:client:adjustfacewear", source, 1) -- Hat
end)

exports['dg-chat']:registerCommand("bril", "Zet je bril op", {}, 'user', function(source)
  TriggerClientEvent("clothing:client:adjustfacewear", source, 2)
end)

exports['dg-chat']:registerCommand("masker", "Zet je masker op", {}, 'user', function(source)
  TriggerClientEvent("clothing:client:adjustfacewear", source, 4)
end)

exports['dg-chat']:registerCommand("vest", "Trek je vest aan", {}, 'user', function(source)
  TriggerClientEvent('dg-clothing:client:adjustBodyArmor', source)
end)

DGX.Inventory.registerUseable('hairnet', function(plyId) 
  TriggerClientEvent('dg-clothing:client:equipHairnet', plyId)
end) 