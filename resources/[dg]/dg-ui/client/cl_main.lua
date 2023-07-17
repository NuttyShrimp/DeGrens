charModule = exports['dg-core']:getModule('characters')

CreateThread(function()
  TriggerEvent('__dg_ui:Ready')
end)

reloadUI = function()
  print('[UI] Restarting UI')
  SetUIFocus(false, false)
  TriggerEvent('dg-ui:reload')
  seedCharData()
end

RegisterCommand('ui-r', function()
  SendAppEvent('main', {
    event = 'restart'
  })
end)

RegisterCommand('getUiFocus', function()
  SetNuiFocus(true, true)
end)

RegisterCommand('removeUiFocus', function()
  SetNuiFocus(false, false)
end)

RegisterNUICallback('reload', function(data, cb)
  reloadUI()
  cb({ data = {}, meta = { ok = true, message = 'UI reloaded' } })
end)

-- data: {app: string, type: 'interactive' | 'passive'}
RegisterNUICallback('dg-ui:applicationClosed', function(data, cb)
  if data.type and data.type == 'interactive' and data.shouldClose then
    SetUIFocusCustom(false, false)
  end
  TriggerEvent('dg-ui:application-closed', data.app)
  cb({
    data = {},
    meta = {
      ok = true,
      message = 'done'
    }
  })
end)

RegisterNUICallback('__appwrapper:setfocus', function(_, cb)
  SetUIFocus(true, true)
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