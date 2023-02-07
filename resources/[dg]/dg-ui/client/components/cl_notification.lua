local notiId = 1

addNotification = function(text, textype, duration, persistent, overrideId)
  local id = nil
  if overrideId then
    id = overrideId
  end
	SendAppEvent('notifications', {
		action = 'add',
		notification = {
			message = text,
			type = textype,
			timeout = duration,
			persistent = persistent,
			id = id
		}
	})
end

removeNotification = function(id)
	SendAppEvent('notifications', {
		action = 'remove',
		id = id
	})
end

-- Notifications can be normal events as they have no significant value apart from providing information
-- Cheaters can use the export anyway
-- addNotif was one of the most used RPC events, might help with server performance

exports('addNotification', addNotification)
exports('removeNotification', removeNotification)

RegisterNetEvent('dg-ui:client:addNotification', addNotification)
RegisterNetEvent('dg-ui:client:removeNotification', removeNotification)
