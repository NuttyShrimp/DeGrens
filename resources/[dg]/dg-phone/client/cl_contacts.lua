RegisterUICallback('phone/contacts/getContacts', function(data, cb)
	DGCore.Functions.TriggerCallback('dg-phone:server:getContacts', function(contacts)
		if contacts.error then
			cb({data = {}, meta={ok=false, message=contacts.message or 'Unknown error'}})
			return
		end
		cb({data = contacts, meta={ok=true, message="done"}})
	end)
end)

RegisterUICallback('phone/contacts/edit', function(data, cb)
	DGCore.Functions.TriggerCallback('dg-phone:server:updateContact', function()
		cb({data = {}, meta={ok=true, message="done"}})
	end, data)
end)

RegisterUICallback('phone/contacts/add', function(data, cb)
	DGCore.Functions.TriggerCallback('dg-phone:server:addContact', function()
		cb({data = {}, meta={ok=true, message="done"}})
	end, data)
end)

RegisterUICallback('phone/contacts/delete', function(data, cb)
	DGCore.Functions.TriggerCallback('dg-phone:server:deleteContact', function()
		cb({data = {}, meta={ok=true, message="done"}})
	end, data)
end)

RegisterNetEvent('dg-phone:server:contacts:shareNumber:accept', function(data)
	SendAppEvent('phone',{
		appName = "contacts",
		action = "openNewContactModal",
		data = {
			phone = data.phone
		}
	})
	if getState('state') == 0 then
		openPhone()
	end
end)