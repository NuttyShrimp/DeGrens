local ads = {}

getAdByPhone = function(phone)
  for k, v in pairs(ads) do
    if v.phone == phone then
      return v
    end
  end
  return nil
end

updateAd = function(ad)
  for k, v in pairs(ads) do
    if v.phone == ad.phone then
      ads[k] = ad
      return
    end
  end
  table.insert(ads, ad)
end

DGX.RPC.register('dg-phone:server:yp:get', function(src)
  return ads
end)

DGX.Events.onNet('dg-phone:server:yp:add', function(src, data)
  local Player = charModule.getPlayer(src)
  _ad = getAdByPhone(phone)
  if _ad == nil then
    _ad = {
      id = #ads + 1,
      name = Player.charinfo.firstname .. ' ' .. Player.charinfo.lastname,
      phone = Player.charinfo.phone,
    }
  end
  _ad.text = data.text
  updateAd(_ad)
  TriggerClientEvent('dg-phone:client:yp:setAd', src, _ad)
end)

DGX.Events.onNet('dg-phone:server:yp:remove', function(src)
  local Player = charModule.getPlayer(src)
  for i = 1, #ads do
    if ads[i].phone == Player.charinfo.phone then
      table.remove(ads, i)
      break
    end
  end
  TriggerClientEvent('dg-phone:client:yp:setAd', src, nil)
end)

DGX.RPC.register('dg-phone:server:yp:getCurrentAd', function(src)
  local Player = charModule.getPlayer(src)
  local phone = Player.charinfo.phone
  return getAdByPhone(phone)
end)