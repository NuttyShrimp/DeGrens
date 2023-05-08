DGX.RPC.register('dg-phone:server:getContacts', function(src)
  local Player = charModule.getPlayer(src)
  if not Player then
    return {
      error = true,
      message = 'Player not found'
    }
  end
  local result = exports['dg-sql']:query('SELECT id, label, phone FROM phone_contacts WHERE cid = ?',
    { Player.citizenid })
  return result ~= nil and result or {}
end)

-- TODO: Add check if return value say if query updated a row
DGX.RPC.register('dg-phone:server:updateContact', function(src, contact)
  local Player = charModule.getPlayer(src)
  if not Player then
    return {
      error = true,
      message = 'Player not found'
    }
  end
  exports['dg-sql']:query('UPDATE phone_contacts SET label = ?, phone = ? WHERE id = ? AND cid = ?',
    { contact.label, contact.phone, contact.id, Player.citizenid })
end)

DGX.RPC.register('dg-phone:server:addContact', function(src, contact)
  local Player = charModule.getPlayer(src)
  if not Player then
    return {
      error = true,
      message = 'Player not found'
    }
  end
  exports['dg-sql']:query('INSERT INTO phone_contacts (cid, label, phone) VALUES (?, ?, ?)',
    { Player.citizenid, contact.label, contact.phone })
end)

DGX.RPC.register('dg-phone:server:deleteContact', function(src, data)
  local Player = charModule.getPlayer(src)
  if not Player then
    return {
      error = true,
      message = 'Player not found'
    }
  end
  exports['dg-sql']:query('DELETE FROM phone_contacts WHERE id = ? AND cid = ?', { data.id, Player.citizenid })
end)

DGX.Events.onNet('dg-phone:server:contacts:shareNumber', function(source)
  local Player = charModule.getPlayer(source)
  if not Player then
    return
  end
  local closePlayers = DGX.Util.getAllPlayersInRange(source)
  local notification = {
    id = ('contacts-share-'):format(Player.charinfo.phone),
    title = 'New Contact',
    description = ("Add %s to contacts?"):format(Player.charinfo.phone),
    icon = "contacts",
    onAccept = 'dg-phone:server:contacts:shareNumber:accept',
    onDecline = 'server:dg-phone:server:contacts:shareNumber:decline',
    _data = {
      phone = Player.charinfo.phone,
    },
    timer = 15,
  }
  for _, id in ipairs(closePlayers) do
    local Target = charModule.getPlayer(id)
    if Target then
      TriggerClientEvent('dg-phone:client:notification:add', id, notification)
    end
  end
end)