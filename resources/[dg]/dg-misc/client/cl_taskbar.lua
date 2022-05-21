local currentTaskId = ''
-- 0 = idle, 1 = running, 2 = canceled, 3 = completed
local state = 0
local propInfo = {}
local taskSettings = {
  canCancel = false,
  cancelOnDeath = false,
  cancelOnMove = false,
  disarm = false,
  disableInventory = false,
  controlDisables = {},
  animation = {},
  prop = {},
}
local baseTaskSettings = DGCore.Shared.copyTbl(taskSettings)
local disabledControlMap = {
  mouse = {
    1,
    2,
    106,
  },

  movement = {
    30,
    31,
    36,
    21,
  },

  carMovement = {
    63,
    64,
    71,
    72,
    75,
  },

  combat = {
    24,
    25,
    37,
    47,
    58,
    140,
    141,
    142,
    143,
    263,
    264,
    257,
  },
}

local function openBar(icon, label, duration)
  openApplication('taskbar', {
    icon = icon,
    label = label,
    duration = duration,
    id = currentTaskId,
  })
  state = 1
end

local function closeBar()
  closeApplication('taskbar')
end

local function loadSettings(newSettings)
  for k, v in pairs(taskSettings) do
    if newSettings[k] ~= nil then
      taskSettings[k] = newSettings[k]
    else
      taskSettings[k] = baseTaskSettings[k]
    end
  end
end

local function loadAnimDict(dict)
  while (not HasAnimDictLoaded(dict)) do
    RequestAnimDict(dict)
    Citizen.Wait(5)
  end
end

-- TODO: check if this is not cancelable
local function startAnimation(ped)
  if taskSettings.animation.task ~= nil then
    TaskStartScenarioInPlace(ped, taskSettings.animation.task, 0, true)
  elseif taskSettings.animation.animDict ~= nil and taskSettings.animation.anim ~= nil then
    if taskSettings.animation.flags == nil then
      taskSettings.animation.flags = 1
    end
    loadAnimDict(taskSettings.animation.animDict)
    TaskPlayAnim(ped, taskSettings.animation.animDict, taskSettings.animation.anim, 3.0, 3.0, -1, taskSettings.animation.flags, 0, 0, 0, 0)
  end
end

local function disableActions(plyId)
  if not taskSettings.controlDisables then
    return
  end
  for cat, controls in pairs(disabledControlMap) do
    if taskSettings.controlDisables[cat] then
      for _, control in ipairs(controls) do
        DisableControlAction(0, control, true)
      end
    end
  end
  if (taskSettings.controlDisables.combat) then
    DisablePlayerFiring(plyId, true)
  end
end

local function spawnProp(ped, data)
  RequestModel(data.model)
  data.hash = GetHashKey(data.model)

  while not HasModelLoaded(data.hash) do
    Citizen.Wait(0)
  end

  local pCoords = GetOffsetFromEntityInWorldCoords(ped, 0.0, 0.0, 0.0)
  local modelSpawn = CreateObject(data.hash, pCoords.x, pCoords.y, pCoords.z, true, true, true)

  local netId = ObjToNet(modelSpawn)
  SetNetworkIdExistsOnAllMachines(netId, true)
  NetworkSetNetworkIdDynamic(netId, true)
  SetNetworkIdCanMigrate(netId, false)
  if data.bone == nil then
    data.bone = 60309
  end

  if data.coords == nil then
    data.coords = { x = 0.0, y = 0.0, z = 0.0 }
  end

  if data.rotation == nil then
    data.rotation = { x = 0.0, y = 0.0, z = 0.0 }
  end

  AttachEntityToEntity(modelSpawn, ped, GetPedBoneIndex(ped, data.bone), data.coords.x, data.coords.y, data.coords.z, data.rotation.x, data.rotation.y, data.rotation.z, 1, 1, 0, 1, 0, 1)
  propInfo[#propInfo.props + 1] = netId
end

local function cleanUp()
  LocalPlayer.state:set("inv_busy", false, true)
  state = 0
  currentTaskId = ''
  local ped = PlayerPedId()
  if taskSettings.animation ~= nil then
    if taskSettings.animation.task ~= nil or (taskSettings.animation.animDict ~= nil and taskSettings.animation.anim ~= nil) then
      ClearPedSecondaryTask(ped)
      StopAnimTask(ped, taskSettings.animation.animDict, taskSettings.animation.anim, 1.0)
    else
      ClearPedTasks(ped)
    end
  end
  for _, prop in pairs(propInfo) do
    DetachEntity(NetToObj(prop), 1, 1)
    DeleteEntity(NetToObj(prop))
  end
  propInfo = { }
  taskSettings = DGCore.Shared.copyTbl(baseTaskSettings)
end

function Taskbar(icon, label, duration, settings, id)
  if currentTaskId ~= '' then
    return
  end
  currentTaskId = id ~= nil and id or 'taskbarid-' .. math.random(100000)
  loadSettings(settings)
  state = 1
  local ped = PlayerPedId()

  if IsEntityDead(ped) and taskSettings.cancelOnDeath then
    return
  end

  if taskSettings.disarm then
    exports['dg-weapons']:removeWeapon()
  end

  if taskSettings.disableInventory then
    LocalPlayer.state:set("inv_busy", true, true)
  end

  openBar(icon, label, duration)

  local plyId = PlayerId()
  local originCoords = GetEntityCoords(ped)
  local endTime = GetGameTimer() + duration
  local curTime = GetGameTimer()

  if taskSettings.animation and DGCore.Shared.tableLen(taskSettings.animation) > 0 then
    startAnimation(ped)
  end

  if taskSettings.prop and DGCore.Shared.tableLen(taskSettings.prop) > 0 then
    spawnProp(ped, taskSettings.prop)
  end

  while state == 1 do
    curTime = GetGameTimer()
    if curTime >= endTime then
      state = 3
    end

    if IsEntityDead(ped) and taskSettings.cancelOnDeath then
      state = 2
    end
    if cancelOnMove and #(GetEntityCoords(ped) - originCoords) > 1.0 then
      state = 2
    end
    disableActions(plyId)
    Wait(0)
  end

  -- Canceled
  if state == 2 then
    openApplication('taskbar', {
      label = 'Canceled',
      duration = 1000,
      id = currentTaskId,
    })
    Wait(1000)
  end

  local canceled = state == 2
  local atPercentage = math.ceil(100 - (((endTime - curTime) / duration) * 100))
  closeBar()
  cleanUp()

  return canceled, atPercentage
end

exports('Taskbar', Taskbar)

RegisterUICallback('taskbar/finished', function(data, cb)
  if state == 1 then
    state = 3
  end
  cb({ data = {}, meta = { ok = true } })
end)

RegisterNetEvent('dg-lib:keyEvent', function(name, isDown)
  if not isDown or name ~= 'taskbar-cancel' then
    return
  end
  if state == 1 and taskSettings.canCancel then
    state = 2
  end
end)

RegisterNetEvent('dg-misc:taskbar:new', function(id, icon, label, duration, settings)
  local wasCompleted, percCompleted = Taskbar(icon, label, duration, settings, id)
  TriggerServerEvent('dg-misc:taskbar:finished', id, wasCompleted, percCompleted)
end)

exports['dg-lib']:registerKeyMapping('taskbar-cancel', 'Taskbar annuleren', '+taskbar-cancel', '-taskbar-cancel', 'ESCAPE', true)