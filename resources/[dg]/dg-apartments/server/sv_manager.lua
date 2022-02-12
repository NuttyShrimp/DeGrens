-- Manager for the active apartments, must be tracked for visitor/raiding list + which routingbucket is free
local activeApartments = {}

local isValueInArray = function(value, array)
  for k, v in ipairs(array) do
    if v == value then
      return k
    end
  end
  return false
end

local getEmptyBucket = function()
	local isBucketFree = function()
		for k,v in pairs(activeApartments) do
			if v.routingBucket == bucketId then
				return false
			end
		end
		return true
	end
	bucketId = 1
	while (not isBucketFree()) do
    bucketId = bucketId + 1
	end
end
local createApartment = function(id, ply)
	activeApartments[id] = {
		type = "alta_street",
		inside = {},
		invited = {}, -- Invited players
		open = false,
		bucket = getEmptyBucket()
	}
end

getCurrentApartment = function(src)
	for k,v in pairs(activeApartments) do
		if isValueInArray(src, v.inside) then
			v.id = k
			return v
    end
	end
end

joinApartment = function(id, ply)
	if (not activeApartments[id]) then
		createApartment(id, ply)
	end
	activeApartments[id].inside[#activeApartments[id].inside + 1] = ply

	return activeApartments[id]
end

removeFromApartment = function(id, ply)
	if (not activeApartments[id]) then
    return
  end
  for k,v in pairs(activeApartments[id].inside) do
    if (v == ply) then
      table.remove(activeApartments[id].inside, k)
    end
  end
	if(#activeApartments[id].inside == 0) then
    activeApartments[id] = nil
  end
end

inviteToApartment = function(aId, plyId)
	if (not activeApartments[aId]) then
    return
  end
  activeApartments[aId].invited[#activeApartments[aId].invited + 1] = plyId
end
removeInviteFromApartment = function(aId, target)
	local isInvited = isValueInArray(target, activeApartments[aId].invited)
	if (isInvited) then
		activeApartments[aId].invited[isInvited] = nil
	end
end

getApartmentInvites = function(aId, src)
	if (not activeApartments[aId]) then
    return
  end
	if (not isValueInArray(src, activeApartments[aId].inside)) then
    return
  end
  return activeApartments[aId].invited
end

--- get all apartments that are unlocked
--- @return table array of apartment id's
getOpenApartments = function()
	local openApartments = {}
  for k,v in pairs(activeApartments) do
    if (v.open) then
      openApartments[#openApartments + 1] = k
    end
  end
  return openApartments
end

--- get all apartments where an source is invited to
--- @param src number
--- @return table array of apartment id's
getInvitedApartments = function(src)
  local invitedApartments = {}
  for k,v in pairs(activeApartments) do
    if (isValueInArray(src, v.invited)) then
      invitedApartments[#invitedApartments + 1] = k
    end
  end
  return invitedApartments
end

doesApartmentExist = function(id)
	if (activeApartments[id]) then
		return true
	end
	local result = exports.oxmysql:executeSync('SELECT id FROM apartments WHERE id = ?', {id})
	return result and result[1] or false
end