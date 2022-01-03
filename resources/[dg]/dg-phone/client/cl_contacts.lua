RegisterNUICallback('contacts:getContacts', function(data, cb)
	DGCore.Functions.TriggerCallback('dg-phone:server:getContacts', function(contacts)
		cb({data = contacts, meta={ok=true, message="done"}})
	end)
end)

RegisterNUICallback('contacts:update', function(data, cb)
	DGCore.Functions.TriggerCallback('dg-phone:server:updateContact', function()
		cb({data = {}, meta={ok=true, message="done"}})
	end, data)
end)

RegisterNUICallback('contacts:add', function(data, cb)
	DGCore.Functions.TriggerCallback('dg-phone:server:addContact', function()
		cb({data = {}, meta={ok=true, message="done"}})
	end, data)
end)

RegisterNetEvent('dg-phone:server:contacts:shareNumber:accept', function(data)
	SendNUIMessage({
		app = "contacts",
		action = "openNewContactModal",
		data = {
			phone = data.phone
		}
	})
	if getState('state') == 0 then
		openPhone()
	end
end)