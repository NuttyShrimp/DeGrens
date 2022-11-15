openPhone = function()
  if not canOpen() then
    return
  end
  openApplication('phone', nil, true)
  SetUIFocusCustom(true, true)
  exports['dg-lib']:shouldExecuteKeyMaps(false)
  setState('state', 1)
end

closePhone = function(state, skipUI)
  if getState('state') == 2 then
    closeCamera()
  end
  if not skipUI then
    closeApplication('phone')
  end
  disablePauseMenu()
  SetUIFocusCustom(false, false)
  setState('state', state or 0)
  exports['dg-lib']:shouldExecuteKeyMaps(state and state == 0 or true)
end

initPhone = function()
  setState('isDisabled', false)
  TriggerEvent('dg-phone:load')
  TriggerServerEvent('dg-phone:load')
  SendAppEvent('phone', {
    action = 'init',
    data = GetCurrentResourceName()
  })
end

unloadPhone = function()
  closeCamera()
  closePhone()
  StopAllAnimation()
  stopSounds()
end

RegisterUICallback('phone/close', function(data, cb)
  if data.inCamera then return end
  closePhone(0, true)
  cb({ data = {}, meta = { ok = true, message = "done" } })
end)

RegisterUICallback('phone/silence', function(data, cb)
  setState('isMuted', data.silenced)
  cb({ data = {}, meta = { ok = true, message = "done" } })
end)

RegisterNetEvent('dg-phone:client:togglePhone', function(toggle)
  if toggle then
    openPhone()
  else
    closePhone()
  end
end)

RegisterNetEvent('DGCore:client:playerLoaded', function()
  setState('characterLoaded', true)
end)

RegisterNetEvent('DGCore:client:playerUnloaded', function()
  closePhone()
  setState('isDisabled', true)
  setState('characterLoaded', false)
end)

RegisterNetEvent('onResourceStart', function(res)
  if res == GetCurrentResourceName() then
    while (not DGCore) do Wait(10) end
    if DGCore.Functions.GetPlayerData() ~= nil then
      initPhone()
      setState('characterLoaded', true)
    end
  end
end)

RegisterNetEvent('onResourceStop', function(res)
  if res == GetCurrentResourceName() then
    unloadPhone()
  end
end)

RegisterNetEvent('dg-ui:loadData', function()
  initPhone()
end)

RegisterNetEvent('dg-ui:reload', function()
  if not getState('characterLoaded') then return end
  unloadPhone()
end)

--region Keybindings
RegisterNetEvent('dg-lib:keyEvent')
AddEventHandler('dg-lib:keyEvent', function(name, isDown)
  if not isDown or not canOpen() then return end
  if name == "openPhone" then
    openPhone()
  end
  if name == 'acceptNotification' then
    SendNUIMessage({
      appName = 'home-screen',
      action = 'acceptNotification'
    })
  end
  if name == "declineNotification" then
    SendNUIMessage({
      appName = 'home-screen',
      action = 'declineNotification'
    })
  end
end)

exports["dg-lib"]:registerKeyMapping("openPhone", "(phone) Open jouw telefoon", '+openPhone', '-openPhone', "M", true)
exports["dg-lib"]:registerKeyMapping("acceptNotification", "(phone) Accepteer melding", '+acceptNotification',
  '-acceptNotification', "", true)
exports["dg-lib"]:registerKeyMapping("declineNotification", "(phone) Weiger melding", '+declineNotification',
  '-declineNotification', "", true)

--endregion