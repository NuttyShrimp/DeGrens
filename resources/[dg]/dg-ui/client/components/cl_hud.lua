-- If new value is added, also add here
state = {
  values = {
    health = 100,
    armor = 100,
    hunger = 0,
    thirst = 0,
  },
  voice = {
    range = 1,
    channel = 0,
    active = false,
    onRadio = false,
  },
  entries = {},
  car = {
    visible = false,
    speed = 0,
    fuel = 0,
    -- true means the icon is shown
    indicator = {
      belt = true,
      engine = false,
      service = false,
    }
  },
  compass = {
    visible = false,
    heading = 0,
    area = '',
    street1 = '',
    street2 = '',
  }
}
cache = {
  id = PlayerId(),
  ped = PlayerPedId()
}
threads = {
  values = false,
  vehicle = false,
  roadName = false,
  compass = false,
}
entryHooks = {}
isDirty = false
isLoggedIn = LocalPlayer.state.loggedIn

hasCompass = false
inVehicle = false

-- TODO: Add fuel for vehicle

--- region Helpers
function toggleHud()
  if isLoggedIn then
    openApplication('hud')
    startValueLoop()
  else
    closeApplication('hud')
  end
end

--- endregion

--- region Hooks
--- These hooks are for values that don't need to be pulled from another resource
RegisterUIEvent("hud/entries/get")
AddEventHandler('__dg_ui:hud/entries/get', function(_, cb)
  cb({ data = state.entries, meta = { ok = true, message = 'done' } })
end)

RegisterNetEvent('hud:client:UpdateNeeds', function(newHunger, newThirst)
  state.values.hunger = newHunger
  state.values.thirst = newThirst
  isDirty = true
end)

RegisterNetEvent('pma-voice:setTalkingMode', function(pRange)
  state.voice.range = pRange
  isDirty = true
end)

RegisterNetEvent('dg-vehicles:seatbelt:toggle', function(toggle)
  state.car.indicator.belt = not toggle
  isDirty = true
end)

RegisterNetEvent("pma-voice:radioActive", function(radioActive)
  state.voice.onRadio = radioActive
  state.voice.active = radioActive
  isDirty = true
end)

RegisterNetEvent('baseevents:enteredVehicle', function()
  inVehicle = true
  startCarLoop()
  startRoadnameLoop()
  startCompassLoop()
end)

RegisterNetEvent('baseevents:leftVehicle', function()
  inVehicle = false
  state.compass.visible = hasCompass
end)

RegisterNetEvent('hud:client:ShowAccounts')
AddEventHandler('hud:client:ShowAccounts', function(amount)
  SendAppEventWESentry('hud', {
    action = 'flashCash',
    data = amount,
  })
end)

RegisterNetEvent('hud:client:OnMoneyChange')
AddEventHandler('hud:client:OnMoneyChange', function(amount)
  cashAmount = exports['dg-financials']:getCash()
  SendAppEventWESentry('hud', {
    action = 'addCashHistory',
    data = amount,
    money = cashAmount
  })
end)

AddStateBagChangeHandler('loggedIn', ('player:%s'):format(GetPlayerServerId(PlayerId())), function(bag, key, value)
  isLoggedIn = value
  toggleHud()
end)

AddStateBagChangeHandler('radioChannel', ('player:%s'):format(GetPlayerServerId(PlayerId())),
  function(bag, key, value)
    state.voice.channel = value
    isDirty = true
  end)

RegisterNetEvent('dg-ui:loadData', function()
  local plyData = DGCore.Functions.GetPlayerData()
  if (plyData and plyData.metadata) then
    state.values.hunger = plyData.metadata.hunger
    state.values.thirst = plyData.metadata.thirst
  end
  state.voice.channel = LocalPlayer.state.radioChannel
  state.voice.range = LocalPlayer.state.proximity.index
  isDirty = true
  for _, entry in ipairs(state.entries) do
    SendAppEvent('hud', {
      action = 'addEntry',
      data = entry
    })
  end
end)
--- endregion
--- region Loops
CreateThread(function()
  while true do
    if isDirty then
      SendAppEventWESentry('hud', {
        action = 'setValues',
        values = state.values,
        voice = state.voice,
      })
    end
    isDirty = false
    Wait(250)
  end
end)
Citizen.CreateThread(function()
  SetEntityProofs(cache.ped, false, false, false, false, false, true, false, false)
  SetPlayerHealthRechargeMultiplier(cache.id, 0.0)
  setMinimapOffset()
  while true do
    if cache.ped ~= PlayerPedId() then
      cache.ped = PlayerPedId()
      SetPedMinGroundTimeForStungun(cache.ped, 5000)
      SetEntityProofs(cache.ped, false, false, false, false, false, true, false, false)
    end
    if cache.id ~= PlayerId() then
      cache.id = PlayerId()
      SetPlayerHealthRechargeMultiplier(cache.id, 0.0)
    end
    SetRadarBigmapEnabled(false, false)
    Wait(2000)
  end
end)
startValueLoop = function()
  local pedVeh = GetVehiclePedIsIn(cache.ped, false)
  inVehicle = pedVeh ~= nil and pedVeh ~= 0
  if inVehicle then
    startCarLoop()
    startRoadnameLoop()
    startCompassLoop()
  end

  if threads.values then
    return
  end
  CreateThread(function()
    threads.values = true
    while isLoggedIn do
      -- if IsPedSwimmingUnderWater(ped) then
      --   isDirty = true
      --   state.values.air = GetPlayerUnderwaterTimeRemaining(ped)
      --   -- Above handles if value is disabled and gets is water, this handles when ply leaves water
      -- elseif state.values.air.enabled ~= IsPedSwimmingUnderWater(ped) then
      --   isDirty = true
      --   state.values.air = 0
      -- end
      pedHealth = GetEntityHealth(cache.ped)
      maxHealth = GetPedMaxHealth(cache.ped)
      health = (pedHealth / maxHealth) * 100
      if state.values.health ~= health then
        isDirty = true
        state.values.health = health
      end
      armor = GetPedArmour(cache.ped)
      if state.values.armor ~= armor then
        isDirty = true
        state.values.armor = armor
      end
      local isTalking = (MumbleIsPlayerTalking(cache.id) == 1)
      if state.voice.active ~= isTalking then
        isDirty = true
        state.voice.active = isTalking
      end
      for name, getter in pairs(entryHooks) do
        newVal = getter(cache.ped, cache.id)
        if newVal ~= state.values[name] then
          state.values[name] = newVal
          isDirty = true
        end
      end
      Wait(100)
    end
    threads.values = false
  end)
end

function startCarLoop()
  if not inVehicle then
    SendAppEventWESentry('hud', {
      action = 'setCarValues',
      data = state.car,
    })
  end
  if threads.vehicle then
    return
  end
  state.car.visible = true
  state.car.indicator.belt = true
  Citizen.CreateThread(function()
    threads.vehicle = true
    while inVehicle do
      local car = GetVehiclePedIsIn(cache.ped, false)
      state.car.speed = math.ceil(GetEntitySpeed(car) * 3.6)
      state.car.indicator.engine = GetVehicleEngineHealth(car) < 500
      SendAppEventWESentry('hud', {
        action = 'setCarValues',
        data = state.car,
      })
      Wait(50)
    end
    threads.vehicle = false
    state.car.visible = false
    state.car.indicator.belt = true
    SendAppEventWESentry('hud', {
      action = 'setCarValues',
      data = state.car,
    })
  end)
end

function startRoadnameLoop()
  if not inVehicle then
    state.compass.area = ""
    state.compass.street1 = ""
    state.compass.street2 = ""
  end
  if threads.roadName then
    return
  end
  Citizen.CreateThreadNow(function()
    threads.roadName = true
    while inVehicle do
      local playerCoords = GetEntityCoords(cache.ped, true)
      zone = tostring(GetNameOfZone(playerCoords))
      state.compass.area = GetLabelText(zone)

      local currentStreetHash, intersectStreetHash = GetStreetNameAtCoord(playerCoords.x, playerCoords.y, playerCoords.z)
      state.compass.street1 = GetStreetNameFromHashKey(currentStreetHash) or ""
      state.compass.street2 = GetStreetNameFromHashKey(intersectStreetHash) or ""

      Wait(500)
    end
    state.compass.area = ""
    state.compass.street1 = ""
    state.compass.street2 = ""
    threads.roadName = false
  end)
end

function startCompassLoop()
  if threads.compass or not inVehicle then
    return
  end
  Citizen.CreateThreadNow(function()
    state.compass.visible = true
    threads.compass = true
    while inVehicle or hasCompass do
      state.compass.heading = math.floor(-GetFinalRenderedCamRot(0).z % 360)
      SendAppEventWESentry('hud', {
        action = 'setCompassValues',
        data = state.compass
      })
      Wait(16)
    end
    state.compass.visible = false
    SendAppEventWESentry('hud', {
      action = 'setCompassValues',
      data = state.compass
    })
    threads.compass = false
  end)
end

function setMinimapOffset()
  Citizen.CreateThread(function()
    Wait(50)
    -- Credit to Dalrae for the solve.
    local defaultAspectRatio = 1920 / 1080 -- Don't change this.
    local resolutionX, resolutionY = GetActiveScreenResolution()
    local aspectRatio = resolutionX / resolutionY
    local minimapOffset = 0
    if aspectRatio > defaultAspectRatio then
      minimapOffset = ((defaultAspectRatio - aspectRatio) / 3.6) - 0.008
    end
    SetMinimapClipType(0)
    SetMinimapComponentPosition("minimap", "L", "B", -0.0145, -0.037, 0.150, 0.188)
    SetMinimapComponentPosition("minimap_mask", "L", "B", 0.010, -0.007, 0.111, 0.159)
    SetMinimapComponentPosition('minimap_blur', 'L', 'B', -0.04, -0.017, 0.266, 0.237)
    SetBlipAlpha(GetNorthRadarBlip(), 0)
    SetRadarBigmapEnabled(true, false)
    SetMinimapClipType(0)
    Wait(50)
    SetRadarBigmapEnabled(false, false)
  end)
end

--- endregion
--- region Entry register
function registerHudEntry(name, iconName, color, getter, order, steps, enabled)
  for _, entry in pairs(state.entries) do
    if entry.name == name then
      print(string.format("Hud entry with name %s already exists, overwriting", name))
      return
    end
  end
  entry = {
    ui = {
      name = iconName,
      color = color,
    },
    name = name,
    enabled = enabled,
    steps = steps or 100,
    order = order,
  }
  state.entries[#state.entries + 1] = state
  state.values[name] = getter(cache.ped, cache.id)
  entryHooks[name] = getter
  SendAppEvent('hud', {
    action = 'addEntry',
    data = entry
  })
end

exports('registerHudEntry', registerHudEntry)
function removeHudEntry(name)
  for i, entry in pairs(state.entries) do
    if entry.name == name then
      table.remove(state.entries, i)
    end
  end
  state.values[name] = nil
  entryHooks[name] = nil
  SendAppEvent('hud', {
    action = "deleteEntry",
    data = {
      name = name,
    }
  })
end

exports('removeHudEntry', removeHudEntry)
function toggleHudEntry(name, isEnabled)
  if not state.values[name] then
    return
  end
  for i, entry in pairs(state.entries) do
    if entry.name == name then
      entry.enabled = isEnabled
    end
  end
  SendAppEvent('hud', {
    action = "toggleEntry",
    data = {
      name = name,
      enabled = isEnabled
    }
  })
end

exports('toggleHudEntry', toggleHudEntry)
--- endregion
