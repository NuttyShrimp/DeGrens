notePromises={}

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
	local insertId = exports['dg-sync']:insert(query, { cid, title, note, date })
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

DGCore.Functions.CreateCallback('dg-phone:server:notes:get', function(src, cb)
	local Player = DGCore.Functions.GetPlayer(src)
	if not Player then return end
	local notes = getNotes(Player.PlayerData.citizenid)
	cb(notes)
end)

DGCore.Functions.CreateCallback('dg-phone:server:notes:new', function(src, cb, data)
	local Player = DGCore.Functions.GetPlayer(src)
	if not Player then return end
	local id = addNote(Player.PlayerData.citizenid, data.title, data.note, data.date)
	data.id = id
	cb(data)
end)

DGCore.Functions.CreateCallback('dg-phone:server:notes:save', function(src, cb, data)
	local Player = DGCore.Functions.GetPlayer(src)
	if not Player then return end
	updateNote(Player.PlayerData.citizenid, data.id, data.note, data.title)
	cb('ok')
end)

DGCore.Functions.CreateCallback('dg-phone:server:notes:delete', function(src, cb, data)
	local Player = DGCore.Functions.GetPlayer(src)
	if not Player then return end
	deleteNote(Player.PlayerData.citizenid, data.id)
	cb()
end)

DGCore.Functions.CreateCallback('dg-phone:server:notes:share', function(src, cb, data)
	local Player = DGCore.Functions.GetPlayer(src)
	if not Player then cb('ok') end
	-- get note
	local note = getNote(Player.PlayerData.citizenid, data.id)
	if not note then cb('ok') end

	local targets = DGCore.Functions.GetPlayersInRadius(src)
	for _, id in ipairs(targets) do
		if tonumber(id) == tonumber(src) then
			goto skip_to_next
		end
		notePromises[#notePromises+1] = {
			note = note,
			origin = Player.PlayerData.source,
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
	cb('ok')
end)

DGCore.Functions.CreateCallback('dg-phone:server:notes:resolve', function(src, cb, data)
	if not notePromises[data.id] then cb('Promise not found') end
	local promise = notePromises[data.id]
	local retval = nil
	if data.accepted and promise.type == 'permanent' then
		local Player = DGCore.Functions.GetPlayer(src)
		retval = addNote(Player.PlayerData.citizenid, promise.note.title, promise.note.note)
	end
	notePromises[data.id] = nil
	cb(retval)
end)