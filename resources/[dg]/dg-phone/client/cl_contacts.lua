RegisterUICallback('phone/contacts/getContacts', function(data, cb)
  local contacts = DGX.RPC.execute('dg-phone:server:getContacts')
  if contacts.error then
    cb({ data = {}, meta = { ok = false, message = contacts.message or 'Unknown error' } })
    return
  end
  cb({ data = contacts, meta = { ok = true, message = "done" } })
end)

RegisterUICallback('phone/contacts/update', function(data, cb)
  DGX.RPC.execute('dg-phone:server:updateContact', data)
  cb({ data = {}, meta = { ok = true, message = "done" } })
end)

RegisterUICallback('phone/contacts/add', function(data, cb)
  DGX.RPC.execute('dg-phone:server:addContact', data)
  cb({ data = {}, meta = { ok = true, message = "done" } })
end)

RegisterUICallback('phone/contacts/delete', function(data, cb)
  DGX.RPC.execution('dg-phone:server:deleteContact', data)
  cb({ data = {}, meta = { ok = true, message = "done" } })
end)

RegisterNetEvent('dg-phone:server:contacts:shareNumber:accept', function(data)
  SendAppEvent('phone', {
    appName = "contacts",
    action = "openNewContactModal",
    data = {
      phone = data.phone
    }
  })
  if getState('state') == 0 then
    openPhone()
  end
end)