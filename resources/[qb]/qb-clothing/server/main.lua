RegisterServerEvent("qb-clothing:saveSkin")
AddEventHandler('qb-clothing:saveSkin', function(model, skin)
  local src = source
  local Player = DGCore.Functions.GetPlayer(src)
  if model ~= nil and skin ~= nil then
    -- TODO: Update primary key to be citizenid so this can be an insert on duplicate update query
    skinCount = exports['dg-sql']:query("SELECT COUNT(*) AS skinCount FROM playerskins WHERE citizenid = ?",
      { Player.PlayerData.citizenid })
    if #skinCount > 0 and skinCount[1].skinCount and skinCount[1].skinCount > 0 then
      exports['dg-sql']:query('DELETE FROM playerskins WHERE citizenid = ?', { Player.PlayerData.citizenid })
    end
    exports['dg-sql']:query('INSERT INTO playerskins (citizenid, model, skin, active) VALUES (?, ?, ?, ?)', {
      Player.PlayerData.citizenid,
      model,
      skin,
      1
    })
  end
end)

RegisterServerEvent("qb-clothes:loadPlayerSkin")
AddEventHandler('qb-clothes:loadPlayerSkin', function()
  local src = source
  local Player = DGCore.Functions.GetPlayer(src)
  local result = exports['dg-sql']:query('SELECT * FROM playerskins WHERE citizenid = ? AND active = ?',
    { Player.PlayerData.citizenid, 1 })
  if result[1] ~= nil then
    TriggerClientEvent("qb-clothes:loadSkin", src, false, result[1].model, result[1].skin)
  else
    TriggerClientEvent("qb-clothes:loadSkin", src, true)
  end
end)

RegisterServerEvent("qb-clothes:saveOutfit")
AddEventHandler("qb-clothes:saveOutfit", function(outfitName, model, skinData)
  local src = source
  local Player = DGCore.Functions.GetPlayer(src)
  if model ~= nil and skinData ~= nil then
    local outfitId = "outfit-" .. math.random(1, 10) .. "-" .. math.random(1111, 9999)
    exports['dg-sql']:query(
      'INSERT INTO player_outfits (citizenid, outfitname, model, skin, outfitId) VALUES (?, ?, ?, ?, ?)', {
      Player.PlayerData.citizenid,
      outfitName,
      model,
      json.encode(skinData),
      outfitId
    }, function()
      local result = exports['dg-sql']:query('SELECT * FROM player_outfits WHERE citizenid = ?',
        { Player.PlayerData.citizenid })
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
  local Player = DGCore.Functions.GetPlayer(src)
  exports['dg-sql']:query('DELETE FROM player_outfits WHERE citizenid = ? AND outfitname = ? AND outfitId = ?', {
    Player.PlayerData.citizenid,
    outfitName,
    outfitId
  }, function()
    local result = exports['dg-sql']:query('SELECT * FROM player_outfits WHERE citizenid = ?',
      { Player.PlayerData.citizenid })
    if result[1] ~= nil then
      TriggerClientEvent('qb-clothing:client:reloadOutfits', src, result)
    else
      TriggerClientEvent('qb-clothing:client:reloadOutfits', src, nil)
    end
  end)
end)

DGCore.Functions.CreateCallback('qb-clothing:server:getOutfits', function(source, cb)
  local src = source
  local Player = DGCore.Functions.GetPlayer(src)
  local anusVal = {}

  local result = exports['dg-sql']:query('SELECT * FROM player_outfits WHERE citizenid = ?',
    { Player.PlayerData.citizenid })
  if result[1] ~= nil then
    for k, v in pairs(result) do
      result[k].skin = json.decode(result[k].skin)
      anusVal[k] = v
    end
    cb(anusVal)
  end
  cb(anusVal)
end)

exports['dg-chat']:registerCommand("helm", "Zet je helm op.", {}, 'user', function(source)
  TriggerClientEvent("clothing:client:adjustfacewear", source, 1) -- Hat
end)

exports['dg-chat']:registerCommand("bril", "Zet je bril op.", {}, 'user', function(source)
  TriggerClientEvent("clothing:client:adjustfacewear", source, 2)
end)

exports['dg-chat']:registerCommand("masker", "Zet je masker op.", {}, 'user', function(source)
  TriggerClientEvent("clothing:client:adjustfacewear", source, 4)
end)