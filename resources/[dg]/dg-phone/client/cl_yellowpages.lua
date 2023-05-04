RegisterUICallback('phone/yellowpages/getList', function(data, cb)
  local list = DGX.RPC.execute('dg-phone:server:yp:get')
  cb({ data = list, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/yellowpages/new', function(data, cb)
  DGX.Events.emitNet('dg-phone:server:yp:add', data)
  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/yellowpages/remove', function(data, cb)
  DGX.Events.emitNet('dg-phone:server:yp:remove')
  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)

RegisterNetEvent('dg-phone:client:yp:setAd', function(ad)
  SendAppEvent('phone', {
    appName = 'yellowpages',
    action = 'setCurrentAd',
    data = ad
  })
end)

RegisterNetEvent('dg-phone:load', function()
  local currentAd = DGX.RPC.execute('dg-phone:server:yp:getCurrentAd')
  SendAppEvent('phone', {
    appName = 'yellowpages',
    action = 'setCurrentAd',
    data = currentAd
  })
end)