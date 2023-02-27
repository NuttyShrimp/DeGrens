local isInputFocused = nil

-- Keys disabled when phone is open
openDisabled = {
  0, -- Next Camera
  1, -- Look Left/Right
  2, -- Look Up/Down
  16, -- Next Weapon
  17, -- Select Previous Weapon
  22, -- Jump
  24, -- Attack
  25, -- Aim
  26, -- Look Behind
  36, -- Input Duck/Sneak
  37, -- Weapon Wheel
  44, -- Cover
  47, -- Detonate
  55, -- Dive
  75, -- Exit Vehicle
  76, -- Vehicle Handbrake
  81, -- Next Radio (Vehicle)
  82, -- Previous Radio (Vehicle)
  91, -- Passenger Aim (Vehicle)
  92, -- Passenger Attack (Vehicle)
  99, -- Select Next Weapon (Vehicle)
  106, -- Control Override (Vehicle)
  114, -- Fly Attack (Flying)
  115, -- Next Weapon (Flying)
  121, -- Fly Camera (Flying)
  122, -- Control OVerride (Flying)
  135, -- Control OVerride (Sub)
  199, -- Pause Menu
  200, -- Pause Menu
  245, -- Chat
}

Citizen.CreateThread(function()
  while true do
    local wait = 100
    local isPhoneOpen = getState('state') == 1
    if isPhoneOpen then
      wait = 0
      if isInputFocused ~= nil then
        DisableAllControlActions(0)
        EnableControlAction(0, 46, true); -- push to talk
        EnableControlAction(0, 249, true); -- push to talk
      else
        for i = 1, #openDisabled do
          DisableControlAction(0, openDisabled[i], true)
        end
      end
      SetPauseMenuActive(false)
    end

    Wait(wait)
  end
end)

setKeysState = function(toggle)
  isInputFocused = toggle
end

disablePauseMenu = function()
  local timeout = GetGameTimer() + 100
  Citizen.CreateThread(function()
    while GetGameTimer() < timeout or IsDisabledControlPressed(0, 200) do
      if IsPauseMenuActive() then
        SetPauseMenuActive(false)
      end
      DisableControlAction(0, 199, true)
      DisableControlAction(0, 200, true)
      Wait(0)
    end
  end)
end

RegisterUICallback('controls/setFocus', function(data, cb)
  if isInputFocused ~= 'edit' then
    setKeysState(data.state and "input" or nil)
  end
  cb({ data = {}, meta = { ok = true, message = 'ok' } })
end)

-- Pause menu cancer
local cachedPauseStatus
CreateThread(function()
  while true do
    Wait(500)

    local isPauseOpen = IsPauseMenuActive() ~= false
    -- Pause opened and hasn't been handled yet
    if isPauseOpen and not cachedPauseStatus then
      setState('isDisabled', true)
      cachedPauseStatus = true
      -- Pause closed and hasn't been undisabled yet
    elseif not isPauseOpen and cachedPauseStatus then
      setState('isDisabled', false)
      cachedPauseStatus = false
    end

    -- Handle if the phone is already visible and escape menu is opened
    if isPauseOpen and getState('state') ~= 0 then
      closePhone()
    end
  end
end)