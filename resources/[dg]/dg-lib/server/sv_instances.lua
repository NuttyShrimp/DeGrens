-- Routingbucket BS centered in 1 file :)

local instances = {}
local namedInstances = {}


--- Set the routing bucket of the player, if instanceId is 0 it resets the routingbucket
--- @param source number
--- @param instanceId number
function setInstance(source, instanceId)
  -- Reset bucket
  currentInstanceId = GetPlayerRoutingBucket(source)
  if currentInstanceId == instanceId then return end
  if instances[currentInstanceId] ~= nil then
    for i, plySrc in pairs(instances[currentInstanceId]) do
      if (plySrc == source) then
        instances[currentInstanceId][i] = nil
      end
    end
    if tblSize(instances[currentInstanceId]) == 0 then
      namedInstances[currentInstanceId] = nil
      instances[currentInstanceId] = nil
    end
  end
  if (not instances[instanceId]) then
    instances[instanceId] = {}
  end
  table.insert(instances[instanceId], source)
  SetPlayerRoutingBucket(source, instanceId)
  SetRoutingBucketPopulationEnabled(instanceId, instanceId == 0)
  TriggerEvent('lib:instance:change', source, instanceId)
  TriggerClientEvent('dg-lib:instance:set', source, instanceId)
end

exports('setInstance', setInstance)

function setInstanceName(instanceId, name)
  namedInstances[instanceId] = name
end

exports('setInstanceName', setInstanceName)

function getInstanceName(instanceId)
  return namedInstances[instanceId]
end

exports('getInstanceName', getInstanceName)

function getTrackedInstances()
  return namedInstances
end

exports('getTrackedInstances', getTrackedInstances)

function isBucketInUse(instanceId)
  return instances[instanceId] ~= nil
end

exports('isBucketInUse', isBucketInUse)

function getFreeInstanceId(startOffset)
  local bucket = startOffset or 1
  while (instances[bucket] ~= nil) do
    bucket = bucket + 1
  end
  return bucket
end

exports('getFreeInstanceId', getFreeInstanceId)