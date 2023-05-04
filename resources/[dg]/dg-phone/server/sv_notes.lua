notePromises = {}

getNotes = function(cid)
  local query = [[
		SELECT id, title, note, date
		FROM phone_notes
		WHERE cid = ?
	]]
  local result = exports['dg-sql']:query(query, { cid })
  return result or {}
end

getNote = function(cid, id)
  local query = [[
		SELECT id, title, note, date
		FROM phone_notes
		WHERE cid = ? AND id = ?
	]]
  local result = exports['dg-sql']:query(query, { cid, id })
  return result and result[1] or nil
end

addNote = function(cid, title, note, date)
  local query = [[
		INSERT INTO phone_notes (cid, title, note, date)
		VALUES (?, ?, ?, NOW()*1000)
	]]
  if date then
    query = [[
			INSERT INTO phone_notes (cid, title, note, date)
			VALUES (?, ?, ?, ?)
		]]
  end
  local insertId = exports['dg-sql']:insert(query, { cid, title, note, date })
  return insertId
end

updateNote = function(cid, id, note, title)
  local query = [[
		UPDATE phone_notes
		SET note = ?, title = ?
		WHERE cid = ? AND id = ?
	]]
  local result = exports['dg-sql']:query(query, { note, title, cid, id })
  return result
end

deleteNote = function(cid, id)
  local query = [[
		DELETE FROM phone_notes
		WHERE cid = ? AND id = ?
	]]
  exports['dg-sql']:query(query, { cid, id })
end

DGX.RPC.register('dg-phone:server:notes:get', function(src)
  local Player = charModule.getPlayer(src)
  if not Player then return end
  local notes = getNotes(Player.citizenid)
  return notes
end)

DGX.RPC.register('dg-phone:server:notes:new', function(src, data)
  local Player = charModule.getPlayer(src)
  if not Player then return end
  local id = addNote(Player.citizenid, data.title, data.note, data.date)
  data.id = id
  return data
end)

DGX.Events.onNet('dg-phone:server:notes:save', function(src, data)
  local Player = charModule.getPlayer(src)
  if not Player then return end
  updateNote(Player.citizenid, data.id, data.note, data.title)
end)

DGX.Events.onNet('dg-phone:server:notes:delete', function(src, data)
  local Player = charModule.getPlayer(src)
  if not Player then return end
  deleteNote(Player.citizenid, data.id)
end)

DGX.Events.onNet('dg-phone:server:notes:share', function(src, data)
  local Player = charModule.getPlayer(src)
  if not Player then return end
  -- get note
  local note = getNote(Player.citizenid, data.id)
  if not note then return end

  local targets = DGX.Util.getAllPlayersInRange(src, 5)
  for _, id in ipairs(targets) do
    if tonumber(id) == tonumber(src) then
      goto skip_to_next
    end
    notePromises[#notePromises + 1] = {
      note = note,
      origin = Player.serverId,
      target = id,
      type = data.type
    }
    local promiseId = #notePromises
    note.readonly = data.type == 'local'
    TriggerClientEvent('dg-phone:client:notes:share', id, note, promiseId)
    SetTimeout(30000, function()
      if notePromises[promiseId] then
        notePromises[promiseId] = nil
      end
    end)
    ::skip_to_next::
  end
end)

DGX.RPC.register('dg-phone:server:notes:resolve', function(src, data)
  if not notePromises[data.id] then return 'Promise not found' end
  local promise = notePromises[data.id]
  local retval = nil
  if data.accepted and promise.type == 'permanent' then
    local Player = charModule.getPlayer(src)
    retval = addNote(Player.citizenid, promise.note.title, promise.note.note)
  end
  notePromises[data.id] = nil
  return retval
end)