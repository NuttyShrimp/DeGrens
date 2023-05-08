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
  local Player = exports['dg-core']:getPlayer(src)
  local result = exports['dg-sql']:query('SELECT id FROM apartments WHERE citizenid = ?', { Player.citizenid })
  if (result == nil or result[1] == nil or result[1].id == nil) then
    createPlayerApartment(src)
    return getPlayerApartment(src)
  end
  return result[1].id
end

createPlayerApartment = function(src)
  local Player = exports['dg-core']:getPlayer(src)
  return exports['dg-sql']:insert('INSERT INTO apartments (citizenid) VALUES (?) ', { Player.citizenid })
end

setInsideMeta = function(src, aId)
  local Player = exports['dg-core']:getPlayer(src)
  local insideMeta = Player.metadata["inside"]
  insideMeta.apartment.id = aId > 0 and aId or nil
  insideMeta.house = nil
  Player.updateMetadata("inside", insideMeta)
end

RegisterNetEvent('dg-apartments:server:setInsideMeta', function(aId)
  setInsideMeta(source, aId)
end)

isInLockdown = function()
  return state.isInLockdown
end
exports('isInLockdown', isInLockdown)

-- id is an optional parameter
enterApartment = function(src, id)
  if (state.isInLockdown) then
    DGX.Notifications.add(src, "Dit appartementsblok is momenteel onder lockdown", "error")
    return
  end
  if (not id) then
    id = getPlayerApartment(src)
  end
  if (not doesApartmentExist(id)) then
    DGX.Notifications.add(src, "Dit appartement heeft geen eigenaar", "error")
    return
  end
  local apartment = joinApartment(id, src)
  DGX.Sounds.playLocalSoundForPlayer(src, 'houses_door_open', 1)
  TriggerClientEvent('dg-apartments:client:doKeyAnim', src)
  TriggerClientEvent('dg-apartments:client:fadeScreen', src, true)
  Citizen.Wait(500)
  SetTimeout(1000, function()
    -- Set player routingbucket
    exports['dg-lib']:setInstance(src, apartment.bucket)
    -- Generate room
    local success = DGX.RPC.execute('dg-apartments:client:enterRoom', src, apartment.type, id)
    -- Set insidemeta
    setInsideMeta(src, id)
    TriggerClientEvent('dg-apartments:client:fadeScreen', src, false)

    if not success then
      SetTimeout(1000, function()
        leaveApartment(src)
      end)
    end
  end)
end
exports('enterApartment', enterApartment)

RegisterNetEvent('dg-apartments:server:enterApartment', function(id)
  enterApartment(source, id)
end)

leaveApartment = function(src)
  local apartment = getCurrentApartment(src);
  local ped = GetPlayerPed(src)
  if not (apartment and apartment.id) then
    return
  end
  DGX.Sounds.playLocalSoundForPlayer(src, 'houses_door_open', 1)
  TriggerClientEvent('dg-apartments:client:doKeyAnim', src)
  TriggerClientEvent('dg-apartments:client:fadeScreen', src, true)
  Citizen.Wait(500)
  removeFromApartment(apartment.id, src)

  local info = getApartmentInfo(apartment.type)
  SetEntityCoords(ped, info.exit)
  SetEntityHeading(ped, info.exit.w)

  TriggerClientEvent('dg-apartments:client:removeRoom', src)
  setInsideMeta(src, 0)
  exports['dg-lib']:setInstance(src, 0)

  TriggerClientEvent('dg-apartments:client:fadeScreen', src, false)
  DGX.Sounds.playLocalSoundForPlayer(src, 'houses_door_close', 0.4)
end
exports('leaveApartment', leaveApartment)

RegisterNetEvent('dg-apartments:server:leaveApartment', function()
  leaveApartment(source)
end)

RegisterNetEvent('dg-apartments:server:logOut', function()
  local src = source
  local apartment = getCurrentApartment(src);
  if not (apartment and apartment.id) then return end
  TriggerClientEvent('dg-apartments:client:fadeScreen', src, true)
  Citizen.Wait(500)
  removeFromApartment(apartment.id, src)
  TriggerClientEvent('dg-apartments:client:removeRoom', src)
  exports['dg-chars']:logOut(src)
end)

RegisterNetEvent('dg-apartments:server:toggleLockDown', function()
  local plyJob = DGX.Jobs.getCurrentJob(source)
  if plyJob ~= "police" then
    -- TODO add ban for injection
  end
  state.isInLockdown = not state.isInLockdown
  DGX.Notifications.add(source,
    state.isInLockdown and 'Dit appartementsblok is nu onder lockdown' or
    'Dit appartementsblok is niet meer onder lockdown')
end)

RegisterNetEvent('dg-apartments:server:inviteApartment')
AddEventHandler('dg-apartments:server:inviteApartment', function(targetId)
  local apartment = getCurrentApartment(source)
  if (not apartment or not apartment.id) then
    return
  end
  inviteToApartment(apartment.id, targetId)
  -- We dont show char name because it allowes players to hide their name and showing steamname is just strange
  DGX.Notifications.add(source, 'Je hebt iemand uitgenodigd in je appartement')
end)

RegisterNetEvent('dg-apartments:server:removeInvite', function(targetId)
  local apartment = getCurrentApartment(source)
  if (not apartment or not apartment.id) then
    return
  end
  removeInviteFromApartment(apartment.id, targetId)
  -- We dont show char name because it allowes players to hide their name and showing steamname is just strange
  DGX.Notifications.add(source, 'Je hebt een uitnodiging tot je appartement verwijderd')
end)

RegisterServerEvent('dg-apartments:server:toggleApartmentLock', function()
  local src = source
  local apartment = getCurrentApartment(source)
  if not apartment or not apartment.id then return end
  local newOpen = not apartment.open
  setApartmentOpen(apartment.id, newOpen)
  DGX.Notifications.add(source, ('Je hebt je appartement %s gezet'):format(newOpen and 'open' or 'op slot'))
end)

-- Callbacks
DGX.RPC.register('dg-apartments:server:getApartmentMenu', function(src)
  local plyJob = DGX.Jobs.getCurrentJob(src)
  local ownedApartId = getPlayerApartment(src)
  local invApart = getInvitedApartments(src)
  local openApart = getOpenApartments()
  local apartList = {}

  -- merge invApart and openApart into openApart & skip duplicates
  for i, v in ipairs(invApart) do
    local alreadyInOpen = false
    for _, k in ipairs(openApart) do
      if v == k then
        alreadyInOpen = true
        break
      end
    end
    if not alreadyInOpen then
      table.insert(openApart, v)
    end
  end

  if plyJob == "police" then
    table.insert(apartList, {
      title = "Raid appartement",
      callbackURL = "dg-apartments:client:openRaidMenu"
    })
  end

  -- add entries to apartList
  for _, v in pairs(openApart) do
    apartList[#apartList + 1] = {
      title = ('Appartement #%s'):format(v),
      description = "Dit appartement binnengaan",
      callbackURL = "dg-apartments:client:enterApartment",
      data = {
        id = v
      }
    }
  end

  if (#apartList < 1) then
    apartList[#apartList + 1] = {
      title = "Er zijn geen appartementen open",
    }
  end

  local menu = {
    {
      title = ('Appartement #%s'):format(ownedApartId),
      description = "Je persoonlijk apparement",
      callbackURL = "dg-apartments:client:enterApartment",
      data = {
        id = ownedApartId,
      },
    },
    {
      title = "Appartement lijst",
      description = "Open of uitgenodigde appartementen",
      submenu = apartList,
    },
  }

  if plyJob == "police" then
    menu[#menu + 1] = {
      title = state.isInLockdown and "Lockdown verwijderen" or "Lockdown starten",
      description = "Beheer lockdown van dit appartementsblok",
      callbackURL = "dg-apartments:client:toggleLockDown",
      data = {}
    }
  end

  return menu
end)

DGX.RPC.register('dg-apartments:server:getCurrentApartment', function(src)
  local apartment = getCurrentApartment(src)
  return apartment and apartment.id or nil
end)

DGX.RPC.register('dg-apartments:server:getApartmentInvites', function(src)
  local apartment = getCurrentApartment(src)
  local invites = getApartmentInvites(apartment.id, src)
  local menu = {}
  for k, v in pairs(invites) do
    local Player = exports['dg-core']:getPlayer(tonumber(v))
    menu[#menu + 1] = {
      title = ('%s %s(%s)'):format(Player.charinfo.firstname, Player.charinfo.lastname, v),
      description = "Uitnodiging verwijderen",
      callbackURL = "dg-apartments:client:removeInvite",
      data = {
        id = v
      }
    }
  end
  if (#menu < 1) then
    menu[#menu + 1] = {
      title = "Geen uitgenodigden",
    }
  end
  return menu
end)