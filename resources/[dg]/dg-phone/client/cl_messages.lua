RegisterUICallback('phone/messages/get', function(data, cb)
  local messages = DGX.RPC.execute('dg-phone:server:getMessages', data)
  cb({ data = messages, meta = { ok = true, message = "done" } })
end)

RegisterUICallback('phone/messages/send', function(data, cb)
  DGX.Events.emitNet('dg-phone:server:message:send', data)
  cb({ data = result, meta = { ok = true, message = "done" } })
end)

RegisterUICallback('phone/messages/set-read', function(data, cb)
  DGX.Events.emitNet('dg-phone:server:message:setRead', nil, data)
  cb({ data = result, meta = { ok = true, message = "done" } })
end)

RegisterNetEvent('dg-phone:client:message:receive', function(message, otherPhone)
  SendAppEvent('phone', {
    appName = 'messages',
    action = 'addNew',
    data = {
      message = message,
      otherPhone = otherPhone
    }
  })
end)