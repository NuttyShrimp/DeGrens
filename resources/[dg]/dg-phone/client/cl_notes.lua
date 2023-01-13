RegisterUICallback('phone/notes/enterEdit', function(data, cb)
  setKeysState(data.edit)
  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/notes/get', function(data, cb)
  local notes = DGCore.Functions.TriggerCallback('dg-phone:server:notes:get', nil)
  cb({ data = notes, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/notes/new', function(data, cb)
  local note = DGCore.Functions.TriggerCallback('dg-phone:server:notes:new', nil, data)
  cb({ data = note, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/notes/save', function(data, cb)
  local note = DGCore.Functions.TriggerCallback('dg-phone:server:notes:save', nil, data)
  cb({ data = note, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/notes/delete', function(data, cb)
  DGCore.Functions.TriggerCallback('dg-phone:server:notes:delete', nil, data)
  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/notes/share', function(data, cb)
  DGCore.Functions.TriggerCallback('dg-phone:server:notes:share', nil, data)
  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)

RegisterUICallback('phone/notes/resolveShare', function(data, cb)
  local id = DGCore.Functions.TriggerCallback('dg-phone:server:notes:resolve', nil, data)
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