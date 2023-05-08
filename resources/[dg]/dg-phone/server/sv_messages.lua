fetchMessages = function(phone, offset, target)
  local query = [[
		SELECT *
		FROM phone_messages
		WHERE sender = ? OR receiver = ?
		ORDER BY id DESC LIMIT ? OFFSET ?;
	]]
  local params = {
    phone,
    phone,
    20,
    offset
  }
  if target ~= nil then
    query = [[
			SELECT *
			FROM phone_messages
			WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?)
			ORDER BY id DESC LIMIT ? OFFSET ?;
		]]
    params = {
      phone, target,
      target, phone,
      20,
      offset
    }
  end
  local result = exports['dg-sql']:query(query, params)
  -- reverse the order
  local messages = {}
  for i = 1, #result do
    table.insert(messages, 1, result[i])
  end
  return messages
end

addMessage = function(phone, target, msg, date)
  local query = [[
		INSERT INTO phone_messages (sender, receiver, message, date, isread)
		VALUES (?, ?, ?, ?, 0);
	]]
  local params = {
    phone,
    target,
    msg,
    date
  }
  return exports['dg-sql']:insert(query, params)
end

setRead = function(phone, target)
  local query = [[
		UPDATE phone_messages
		SET isread = 1
		WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?);
	]]
  local params = {
    phone,
    target,
    target,
    phone
  }
  return exports['dg-sql']:query(query, params)
end

DGX.RPC.register('dg-phone:server:getMessages', function(src, data)
  local Player = charModule.getPlayer(src)
  local _messages = fetchMessages(Player.charinfo.phone, data.offset or 0, data.target)
  -- Key, value pairs of messages, key is phone number that differs from the player's phone number
  local messages = {}
  for _, message in ipairs(_messages) do
    local key = message.sender == Player.charinfo.phone and message.receiver or message.sender
    if not messages[key] then
      messages[key] = {}
    end
    messages[key][#messages[key] + 1] = {
      id = message.id,
      message = message.message,
      isread = message.isread,
      isreceiver = message.receiver == Player.charinfo.phone,
      date = message.date,
    }
  end
  return messages
end)

DGX.Events.onNet('dg-phone:server:message:send', function(src, data)
  local Player = charModule.getPlayer(src)
  local insertId = addMessage(Player.charinfo.phone, data.target, data.msg, data.date)
  local msg = {
    id = insertId,
    message = data.msg,
    isread = false,
    isreceiver = false,
    date = data.date,
  }
  TriggerClientEvent('dg-phone:client:message:receive', src, msg, data.target)
  local Target = charModule.getPlayerByPhone(data.target)
  if Target then
    msg.isreceiver = true
    TriggerClientEvent('dg-phone:client:message:receive', Target.source, msg, Player.charinfo.phone)
  end
end)

DGX.Events.onNet('dg-phone:server:message:setRead', function(src, data)
  local Player = charModule.getPlayer(src)
  setRead(Player.charinfo.phone, data.target)
end)