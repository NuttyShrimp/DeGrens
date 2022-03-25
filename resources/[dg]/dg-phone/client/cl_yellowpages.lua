RegisterUICallback('phone/yellowpages/getList', function(data, cb)
  local list = DGCore.Functions.TriggerCallback('dg-phone:server:yp:get', nil)
  cb({ data = list, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/yellowpages/new', function(data, cb)
  DGCore.Functions.TriggerCallback('dg-phone:server:yp:add', nil, data)
  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/yellowpages/remove', function(data, cb)
  DGCore.Functions.TriggerCallback('dg-phone:server:yp:remove', nil)
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
  local currentAd = DGCore.Functions.TriggerCallback('dg-phone:server:yp:getCurrentAd', nil)
  SendAppEvent('phone', {
    appName = 'yellowpages',
    action = 'setCurrentAd',
    data = currentAd
  })
end)