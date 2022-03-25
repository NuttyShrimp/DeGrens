RegisterUICallback('phone/notifications/event', function(data, cb)
	local event = data.event
	local isAccept = data.isAccept
	local eventData = data.data
	-- check if events starts with server:
	if string.match(event, '^server:') ~= nil then
		event = event:sub(8)
		TriggerServerEvent(event, eventData, isAccept)
	else
		TriggerEvent(event, eventData, isAccept)
	end

	cb({data={}, meta={ok=true, message='done'}})
end)

--- function addNotification
--- Adds notification to phone (normally stays for 8 seconds
--- if action is needed time will be extended to 30 seconds)
addNotification = function(notification)
	SendAppEvent('phone', {
		appName = "home-screen",
		action = "addNotification",
		data = notification
	})
end
exports('addNotification', addNotification)
RegisterNetEvent('dg-phone:client:notification:add', addNotification)

removeNotification = function(id)
	SendAppEvent('phone', {
		appName = "home-screen",
		action = "removeNotification",
		data = id
	})
end
exports('removeNotification', removeNotification)
RegisterNetEvent('dg-phone:client:notification:remove', removeNotification)

--- Update a existing notification
--- @param id string
--- @param notification table
--- notification is same structure as above
--- The diff between them is that this each element of this table is optional
updateNotification = function(id, noti)
	SendAppEvent('phone', {
		appName = "home-screen",
		action = "updateNotification",
		data = {
			id = id,
			notification = noti
		}
	})
end
exports('updateNotification', updateNotification)
RegisterNetEvent('dg-phone:client:notification:update', updateNotification)