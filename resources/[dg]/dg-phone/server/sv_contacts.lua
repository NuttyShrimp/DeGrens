DGCore.Functions.CreateCallback('dg-phone:server:getContacts', function(src, cb)
	local Player = DGCore.Functions.GetPlayer(src)
	if not Player then
		cb({
			error = true,
			message = 'Player not found'
		})
	end
	local result = exports['dg-sql']:query('SELECT id, label, phone FROM phone_contacts WHERE cid = ?', { Player.PlayerData.citizenid })
	cb(result ~= nil and result or {})
end)

-- TODO: Add check if return value say if query updated a row
DGCore.Functions.CreateCallback('dg-phone:server:updateContact', function(src, cb, contact)
	local Player = DGCore.Functions.GetPlayer(src)
	if not Player then
		cb({
			error = true,
			message = 'Player not found'
		})
	end
	exports['dg-sql']:query('UPDATE phone_contacts SET label = ?, phone = ? WHERE id = ? AND cid = ?', { contact.label, contact.phone, contact.id, Player.PlayerData.citizenid })
	cb()
end)

DGCore.Functions.CreateCallback('dg-phone:server:addContact', function(src, cb, contact)
	local Player = DGCore.Functions.GetPlayer(src)
	if not Player then
		cb({
			error = true,
			message = 'Player not found'
		})
	end
	exports['dg-sql']:query('INSERT INTO phone_contacts (cid, label, phone) VALUES (?, ?, ?)', { Player.PlayerData.citizenid, contact.label, contact.phone })
	cb()
end)

DGCore.Functions.CreateCallback('dg-phone:server:deleteContact', function(src, cb, data)
		local Player = DGCore.Functions.GetPlayer(src)
	if not Player then
		cb({
			error = true,
			message = 'Player not found'
		})
	end
	exports['dg-sql']:query('DELETE FROM phone_contacts WHERE id = ? AND cid = ?', { data.id, Player.PlayerData.citizenid })
	cb()
end)

RegisterNetEvent('dg-phone:server:contacts:shareNumber', function()
	local Player = DGCore.Functions.GetPlayer(source)
	if not Player then
		return
	end
	local closePlayers = DGX.Util.getAllPlayersInRange(source)
	local notification = {
		id = ('contacts-share-'):format(Player.PlayerData.charinfo.phone),
		title = 'New Contact',
		description = ("Add %s to contacts?"):format(Player.PlayerData.charinfo.phone),
		icon = "contacts",
		onAccept = 'dg-phone:server:contacts:shareNumber:accept',
		onDecline = 'server:dg-phone:server:contacts:shareNumber:decline',
		_data = {
			phone = Player.PlayerData.charinfo.phone,
		},
		timer = 15,
	}
	for _, id in ipairs(closePlayers) do
		local Target = DGCore.Functions.GetPlayer(id)
		if Target then
			TriggerClientEvent('dg-phone:client:notification:add', id, notification)
		end
	end
end)
