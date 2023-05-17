local currentRoutingBucket = 0

RegisterNetEvent("dg-lib:instance:set", function(instanceId)
  currentRoutingBucket = tonumber(instanceId)
end)

exports("getRoutingBucket", function()
  return currentRoutingBucket
end)