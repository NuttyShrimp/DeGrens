CreateThread(function()
	TriggerEvent('__dg_ui:Ready')
end)

reloadUI = function(skipNUI)
  if skipNUI ~= false then
    SendAppEvent('main', {
      event = 'restart'
    })
  end
  SetUIFocus(false, false)
  TriggerEvent('dg-ui:reload')
	seedCharData()
end

RegisterCommand('ui-r', reloadUI)

RegisterNUICallback('reload', function(data, cb)
	reloadUI(false)
	cb({ data = {}, meta = { ok = true, message = 'UI reloaded' } })
end)

RegisterNUICallback('dg-ui:applicationClosed', function(data, cb)
	SetNuiFocus(false, false)
	TriggerEvent('dg-ui:application-closed', data.app, data)
	cb({
		data = {},
		meta = {
			ok = true,
			message = 'done'
		}
	})
end)

RegisterNUICallback('__appwrapper:setfocus', function(_, cb)
	SetNuiFocus(true, true)
	cb({
		data = {},
		meta = {
			ok = true,
			message = 'done'
		}
	})
end)

RegisterNetEvent('dg-ui:openApplication')
AddEventHandler('dg-ui:openApplication', openApplication)

RegisterNetEvent('dg-ui:closeApplication')
AddEventHandler('dg-ui:closeApplication', closeApplication)

if GetConvar('is_production', 'true') == 'false' then
	RegisterCommand('ui:debug:show', function()
		openApplication('debuglogs', {}, true)
	end)
	RegisterCommand('ui:debug:hide', function()
		closeApplication('debuglogs')
	end)
end