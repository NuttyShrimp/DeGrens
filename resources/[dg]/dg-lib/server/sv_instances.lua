-- Routingbucket BS centered in 1 file :)

local instances = {}
local namedInstances = {}


--- Set the routing bucket of the player, if instanceId is 0 it resets the routingbucket
--- @param source number
--- @param instanceId number
function setInstance(source, instanceId)
	-- Reset bucket
	currentInstanceId = GetPlayerRoutingBucket(source)
	for i,plySrc in ipairs(instances[currentInstanceId]) do
		if (plySrc == source) then
			instances[currentInstanceId][i] = nil
		end
	end
	if #instances[currentInstanceId] == 0 then
		namedInstances[currentInstanceId] = nil
		instances[currentInstanceId] = nil
	end
	if (not instances[instanceId]) then
		instances[instanceId] = {source}
	end
	SetPlayerRoutingBucket(source, instanceId)
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
