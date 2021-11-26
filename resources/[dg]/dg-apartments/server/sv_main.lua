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
	local result = exports.oxmysql:executeSync('SELECT id,citizenid FROM apartments WHERE citizenid = ?', {Player.PlayerData.citizenid})
	return result[1]
end

createPlayerApartment = function(src)
	local Player = DGCore.Functions.GetPlayer(src);
	return exports.oxmysql:insertSync('INSERT INTO apartments (citizenid) VALUES (?) ', {Player.PlayerData.citizenid})
end

setInsideMeta = function(src, aId)
	local Player = DGCore.Functions.GetPlayer(src)
	local insideMeta = Player.PlayerData.metadata["inside"]
	insideMeta.apartment.id = aId > 0 and aId or nil
	insideMeta.house = nil
	Player.Functions.SetMetaData("inside", insideMeta)
end

RegisterNetEvent('dg-apartments:server:setInsideMeta', function(aId)
	setInsideMeta(source, aId)
end)

-- id is an optional parameter
enterApartment = function(src, id)
	local Player = DGCore.Functions.GetPlayer(src)
	if (state.isInLockdown) then
    TriggerClientEvent('DGCore:Notify', src, "Het appartementsblok is momenteel onder lockdown", "error")
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
	setInsideMeta(src, id)
	TriggerClientEvent('dg-apartments:client:fadeScreen', src, false)
end
exports('enterApartment', enterApartment)

RegisterNetEvent('dg-apartments:server:enterApartment', function(id)
  enterApartment(source, id)
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
	setInsideMeta(src, 0)

	TriggerClientEvent('dg-apartments:client:fadeScreen', src, false)
	TriggerEvent("InteractSound_SV:PlayOnOne", src, "houses_door_close", 0.1)
end
exports('leaveApartment', leaveApartment)

RegisterNetEvent('dg-apartments:server:leaveApartment', function()
	leaveApartment(source)
end)

RegisterNetEvent('dg-apartments:server:toggleLockDown', function()
	local Player = DGCore.Functions.GetPlayer(source)
	if (Player.PlayerData.job.name ~= "police" or not Player.PlayerData.job.onduty) then
		-- TODO add ban for injection
	end
	state.isInLockdown = not state.isInLockdown
	TriggerClientEvent('DGCore:Notify', source,state.isInLockdown and 'The apartment is under lockdown' or 'The lockdown has been lifted')
end)

RegisterNetEvent('dg-apartments:server:inviteApartment')
AddEventHandler('dg-apartments:server:inviteApartment', function(targetId)
	local apartment = getCurrentApartment(source)
	if (not apartment or not apartment.id) then return end
	inviteToApartment(apartment.id, targetId)
	TriggerClientEvent('DGCore:Notify', source, 'You invited ' .. GetPlayerName(targetId) .. ' to your apartment')
end)

RegisterNetEvent('dg-apartments:server:removeInvite', function(targetId)
	local apartment = getCurrentApartment(source)
	if (not apartment or not apartment.id) then return end
	removeInviteFromApartment(apartment.id, targetId)
	TriggerClientEvent('DGCore:Notify', source, 'You have removed ' .. GetPlayerName(targetId) .. '\'s invite from the apartment')
end)

-- Callbacks
DGCore.Functions.CreateCallback('dg-apartments:server:getApartmentMenu', function(src, cb)
	local Player = DGCore.Functions.GetPlayer(src)
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

	if (Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty) then
		table.insert(apartList, {
      title = "Raid apartment",
			action = "dg-apartments:client:openRaidMenu"
    })
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

	if (Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty) then
		menu[#menu+1] = {
			title = ("%s"):format(state.isInLockdown and "Remove lockdown" or "Lockdown apartment"),
			description = "Prevent citizens to enter their apartment",
			action = "dg-apartments:client:toggleLockDown",
			data = {}
		}
	end

	cb(menu)
end)

DGCore.Functions.CreateCallback('dg-apartments:server:getCurrentApartment', function(src,cb)
	local apartment = getCurrentApartment(src)
  cb(apartment.id)
end)

DGCore.Functions.CreateCallback('dg-apartments:server:getApartmentInvites', function(src, cb)
	local apartment = getCurrentApartment(src)
	local invites = getApartmentInvites(apartment.id, src)
	local menu = {
    {
      title = "Go back",
      back = true
    }
  }
	for k,v in pairs(invites) do
		menu[#menu+1] = {
			title = ('%s(%s)'):format(GetPlayerName(v), v),
			description = "Remove invite",
			action = "dg-apartments:client:removeInvite",
			data  = {
				id = v
			}
		}
	end
	if (#menu < 2) then
    menu[#menu+1] = {
      title = "No invites",
    }
  end
	cb(menu)
end)