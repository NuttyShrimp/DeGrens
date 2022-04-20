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

CreateThread(function()
    Wait(100) -- DGX is nil for some reason when restarting, bcs of executing order whatever so we wait a little simple hackez
    DGX.RPC.register('dg-ui:client:addNotification', function(...)
        return addNotification(...)
    end)
    DGX.RPC.register('dg-ui:client:removeNotification', function(...)
        return removeNotification(...)
    end)
end)
