DGCore = exports['dg-core']:GetCoreObject()

local state = {
	isInLockdown = false,
}

local getApartmentInfo = function(type)
  for _, apartment in pairs(Config.Locations) do
    if apartment.name == type then
      return apartment
    end
  end
end

getPlayerApartment = function(src)
	local Player = DGCore.Functions.GetPlayer(src);
	local result = exports.oxmysql:executeSync('SELECT id,cid FROM apartments_new WHERE cid = ?', {Player.PlayerData.citizenid})
	return result[1]
end

createPlayerApartment = function(src)
	local Player = DGCore.Functions.GetPlayer(src);
	return exports.oxmysql:insertSync('INSERT INTO apartments_new (cid) VALUES (?) ', {Player.PlayerData.citizenid})
end

-- id is an optional parameter
enterApartment = function(src, id, new)
	local Player = DGCore.Functions.GetPlayer(src)
	if (state.isInLockdown) then
    TriggerClientEvent('DGCore:Notify', "Het appartementsblok is momenteel onder lockdown", "error")
    return
  end
	if (not id) then
    id = getPlayerApartment(src)
  end
	local apartment = joinApartment(id, src)
	TriggerEvent("InteractSound_SV:PlayOnOne", src, "houses_door_open", 0.1)
	TriggerClientEvent('dg-apartments:client:doKeyAnim', src)
	TriggerClientEvent('dg-apartments:client:fadeScreen', src, true)
	Citizen.Wait(500)
	-- Set player routingbucket
	SetPlayerRoutingBucket(src, apartment.bucket)
	-- Generate room
	TriggerClientEvent('dg-apartments:client:generateRoom', src, apartment.type)
	-- disable weathersynv
	TriggerClientEvent('dg-weathersync:client:DisableSync', src)
	-- Set insidemeta
	TriggerClientEvent('dg-apartments:client:fadeScreen', src, false)
	if new then
		Citizen.SetTimeout(1000, function()
			TriggerEvent('qb-clothes:client:CreateFirstCharacter')
		end)
	end
end

RegisterNetEvent('dg-apartments:server:enterApartment', function(id, new)
  enterApartment(source, id, new)
end)

leaveApartment = function(src)
	local apartment = getCurrentApartment(src);
	local ped = GetPlayerPed(src)
	if (not apartment.id) then return end
	TriggerEvent("InteractSound_SV:PlayOnOne", src, "houses_door_open", 0.1)
	TriggerClientEvent('dg-apartments:client:doKeyAnim', src)
	TriggerClientEvent('dg-apartments:client:fadeScreen', src, true)
	Citizen.Wait(500)
	removeFromApartment(apartment.id, src)

	local info = getApartmentInfo(apartment.type)
	SetEntityCoords(ped, info.exit)
	SetEntityHeading(ped, info.exit.w)

	TriggerClientEvent('dg-apartments:client:removeRoom', src)
	TriggerClientEvent('dg-weathersync:client:EnableSync', src)

	TriggerClientEvent('dg-apartments:client:fadeScreen', src, false)
	TriggerEvent("InteractSound_SV:PlayOnOne", src, "houses_door_close", 0.1)
end

RegisterNetEvent('dg-apartments:server:leaveApartment', function()
	leaveApartment(source)
end)

-- Callbacks
DGCore.Functions.CreateCallback('dg-apartments:server:getApartmentMenu', function(src, cb)
	local ownedApartment = getPlayerApartment(src)
	local invApart = getInvitedApartments(src)
	local openApart = getOpenApartments()
	local apartList = {
		{
			title = "Go back",
			back = true
		}
	}
	-- merge invApart and openApart into openApart & skip duplicates
	for i,v in ipairs(invApart) do
    local found = false
    for j,k in ipairs(openApart) do
      if (v == k) then
        found = true
        break
      end
    end
    if (not found) then
      table.insert(openApart, v)
    end
  end

	-- add entries to apartList
	for k,v in pairs(openApart) do
		apartList[#apartList+1] = {
			title = ('Apartment #%s'):format(k),
			description = "Enter this apartment",
			action = "dg-apartments:client:enterApartment",
			data = {
				id = k
			}
		}
	end

	if (#apartList < 2) then
    apartList[#apartList+1] = {
      title = "No apartments are open",
    }
  end

	local menu = {
		{
			title = ("Enter apartment %s"):format(ownedApartment.id),
			description = "Enter your private apartment",
			action = "dg-apartments:client:enterApartment",
			data = {
				id = ownedApartment.id,
      },
		},
		{
			title = "Apartment list",
			description = "Invited/Open apartment list",
			submenus = apartList,
		},
	}
	cb(menu)
end)

DGCore.Functions.CreateCallback('dg-apartments:server:getCurrentApartment', function(src,cb)
	local apartment = getCurrentApartment(src)
  cb(apartment.id)
end)