RegisterUICallback('phone/notes/enterEdit', function(data, cb)
  setKeysState(data.edit and "edit" or nil)
  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/notes/get', function(data, cb)
  local notes = DGX.RPC.execute('dg-phone:server:notes:get')
  cb({ data = notes, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/notes/new', function(data, cb)
  local note = DGX.RPC.execute('dg-phone:server:notes:new', data)
  cb({ data = note, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/notes/save', function(data, cb)
  DGX.Events.emitNet('dg-phone:server:notes:save', data)
  cb({ data = "ok", meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/notes/delete', function(data, cb)
  DGX.Events.emitNet('dg-phone:server:notes:delete', data)
  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/notes/share', function(data, cb)
  DGX.Events.emitNet('dg-phone:server:notes:share', data)
  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/notes/resolveShare', function(data, cb)
  local id = DGX.RPC.execute('dg-phone:server:notes:resolve', data)
  if id == nil then
    cb({ data = {}, meta = { ok = true, message = 'done' } })
  elseif type(id) == 'string' then
    cb({ data = {}, meta = { ok = false, message = id } })
  else
    cb({ data = id, meta = { ok = true, message = 'done' } })
  end
end)

RegisterNetEvent('dg-phone:client:notes:share', function(note, id)
  SendAppEvent('phone', {
    appName = "notes",
    action = 'share',
    data = { id = id, note = note }
  })
end)