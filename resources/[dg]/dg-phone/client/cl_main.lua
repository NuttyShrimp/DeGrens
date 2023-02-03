openPhone = function()
  if not canOpen() then
    return
  end
  openApplication('phone', nil, true)
  SetUIFocusCustom(true, true)
  exports['dg-lib']:shouldExecuteKeyMaps(false)
  setState('state', 1)
  DGX.Weapons.removeWeapon(nil, true)
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
  SendAppEvent('phone', {
    action = 'init',
    data = GetCurrentResourceName()
  })
  TriggerEvent('dg-phone:load')
  TriggerServerEvent('dg-phone:load')
end

unloadPhone = function()
  closeCamera()
  closePhone()
  StopAllAnimation()
  stopSounds()
  cleanInfoEntries()
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

DGX.UI.onLoad(function()
  initPhone()
end)

DGX.UI.onUIReload(function()
  if not getState('characterLoaded') then return end
  unloadPhone()
end)

--region Keybindings
DGX.Keys.register('openPhone', '(phone) Open Telefoon', 'M')
DGX.Keys.register('acceptNotification', '(phone) Melding Accepteren')
DGX.Keys.register('declineNotification', '(phone) Melding Weigeren')

DGX.Keys.onPressDown('openPhone', function()
  if not canOpen() then return end
  openPhone()
end)
DGX.Keys.onPressDown('acceptNotification', function()
  if not canOpen() then return end
  SendNUIMessage({
    appName = 'home-screen',
    action = 'acceptNotification'
  })
end)
DGX.Keys.onPressDown('declineNotification', function()
  if not canOpen() then return end
  SendNUIMessage({
    appName = 'home-screen',
    action = 'declineNotification'
  })
end)
--endregion