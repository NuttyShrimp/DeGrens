local attachedNetIds = {} -- Map<propId, netId>
local currentPropId = 0
local instanceId = 0
local isPlayerSpawned = false

AddEventHandler('propattach:playerLoaded', function()
  isPlayerSpawned = true
end)

AddEventHandler('onResourceStart', function(resourceName)
  if resourceName ~= GetCurrentResourceName() then return end
  isPlayerSpawned = exports['dg-chars'].isSpawned()
end)

add = function(name, offset)
  while not isPlayerSpawned do
    Citizen.Wait(100)
  end

	if not name then 
    print(("[%s] Tried to attach object without providing objectname."):format(GetCurrentResourceName()))
    return 
  end

	local listEntry = props[name]
	if not listEntry then 
    print(("[%s] Tried to attach unregistered object with name: %s."):format(GetCurrentResourceName(), name))
    return 
  end

	local ped = PlayerPedId()
  local pos = GetEntityCoords(ped)
	local bone = GetPedBoneIndex(ped, listEntry.boneId)
  offset = offset or vector3(0, 0, 0)
  local coords = vector3(listEntry.x + offset.x, listEntry.y + offset.y, listEntry.z + offset.z)
  
  RequestModel(listEntry.model)
	while not HasModelLoaded(listEntry.model) do 
    Citizen.Wait(10) 
  end
	local entity = CreateObject(listEntry.model, pos.x, pos.y, pos.z, true, false, false)
	AttachEntityToEntity(entity, ped, bone, coords.x, coords.y, coords.z, listEntry.rx, listEntry.ry, listEntry.rz, true, true, false, false, 2, true)
  SetEntityCompletelyDisableCollision(entity, false, true)
  local netId = NetworkGetNetworkIdFromEntity(entity)
  TriggerServerEvent('propattach:server:registerId', netId, instanceId)
  SetModelAsNoLongerNeeded(listEntry.Model)
  currentPropId = currentPropId + 1
  attachedNetIds[currentPropId] = {
    netId = netId, 
    name = name,
  }
  return currentPropId
end
exports('add', add)

move = function(propId, offset) 
  if not propId then 
    print(("[%s] Tried to move obj without providing id."):format(GetCurrentResourceName()))
    return 
  end

	if not attachedNetIds[propId] then 
    debug(("[%s] Tried to move unattached obj with name: %s."):format(GetCurrentResourceName(), propId))
    return 
  end

  local netId = attachedNetIds[propId].netId
  local entity = NetworkGetEntityFromNetworkId(netId)
  if DoesEntityExist(entity) then
    local ped = PlayerPedId()
    local listEntry = props[attachedNetIds[propId].name]
    local bone = GetPedBoneIndex(ped, listEntry.boneId)
    local ped = PlayerPedId();
    local coords = vector3(listEntry.x + offset.x, listEntry.y + offset.y, listEntry.z + offset.z)
    DetachEntity(entity, true, false);
    AttachEntityToEntity(entity, ped, bone, coords.x, coords.y, coords.z, listEntry.rx, listEntry.ry, listEntry.rz, true, true, false, false, 2, true)
    SetEntityCompletelyDisableCollision(entity, false, true)
  end
end
exports('move', move)

remove = function(propId)
  if not propId then 
    print(("[%s] Tried to remove obj without providing id."):format(GetCurrentResourceName()))
    return 
  end

	if not attachedNetIds[propId] then 
    debug(("[%s] Tried to remove unattached obj with name: %s."):format(GetCurrentResourceName(), propId))
    return 
  end

  local netId = attachedNetIds[propId].netId
  TriggerServerEvent('propattach:server:unregisterId', netId)
  local entity = NetworkGetEntityFromNetworkId(netId)
  if DoesEntityExist(entity) then
    DeleteEntity(entity)
  end
  attachedNetIds[propId] = nil
end
exports('remove', remove)

RegisterNetEvent('dg-lib:instance:set', function(newInstanceId)
  if instanceId == newInstanceId then return end
  instanceId = newInstanceId 
  if DGCore.Shared.tableLen(attachedNetIds) == 0 then return end
  TriggerServerEvent('propattach:server:updateInstance', instanceId)
end)

