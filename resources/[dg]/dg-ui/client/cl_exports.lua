local Events = {}

function SendUIMessage(data)
  SendNUIMessage(data)
end

exports('SendUIMessage', SendUIMessage)

function RegisterUIEvent(eventName)
  if (not Events[eventName]) then
    Events[eventName] = true
    RegisterNUICallback(eventName, function(data, cb)
      TriggerEvent(('__dg_ui:%s'):format(eventName), data, cb)
    end)
  end
end

exports('RegisterUIEvent', RegisterUIEvent)

function SetUIFocusCustom(hasKeyboard, hasMouse)
  SetNuiFocus(hasKeyboard, hasMouse)
  SetNuiFocusKeepInput(hasKeyboard or hasMouse)
end

exports('SetUIFocusCustom', SetUIFocusCustom)

function SetUIFocus(hasKeyboard, hasMouse)
  SetNuiFocus(hasKeyboard, hasMouse)
end

exports('SetUIFocus', SetUIFocus)

function SendAppEvent(app, data)
  SendUIMessage({
    app = app,
    data = data or {}
  })
end

function SendAppEventWESentry(app, data)
  SendUIMessage({
    app = app,
    data = data or {},
    skipSentry = true
  })
end

exports('SendAppEvent', SendAppEvent)
RegisterNetEvent('dg-ui:SendAppEvent', SendAppEvent)

function openApplication(app, data, preventFocus)
  SendUIMessage({
    app = app,
    show = true,
    data = data or {},
    shouldFocus = not preventFocus
  })
end

exports('openApplication', openApplication)

function closeApplication(app, data)
  SendUIMessage({
    app = app,
    show = false,
    data = data or {},
  })
end

exports('closeApplication', closeApplication)