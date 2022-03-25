local notiId = 1

addNotification = function(text, textype, length, persistent)
	if persistent then
		id = 'ui'..notiId
		notiId = notiId + 1
	end
	SendAppEvent('notifications', {
		action = 'add',
		notification = {
			message = text,
			type = textype,
			timeout = length,
			persistent = persistent,
			id = id
		}
	})
	return id
end
exports('addNotification', addNotification)

removeNotification = function(id)
	SendAppEvent('notifications', {
		action = 'remove',
		id = id
	})
end
exports('removeNotification', removeNotification)

