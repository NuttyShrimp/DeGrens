DGCore.Players = {}
DGCore.Player = {}
DGCore.cidToPlyId = {}

-- On player login get their data or set defaults
-- Don't touch any of this unless you know what you are doing
-- Will cause major issues!

-- Takes the raw playerdata from the database and returns the unpacked version
-- This is splitted into a seperate function so we can reuse it in other parts of the core
function DGCore.Player.buildPlayerData(playerData)
  if not playerData then
    DGCore.ShowError(GetCurrentResourceName(), "[Player] buildPlayer: PlayerData is nil")
    return nil
  end
  -- Unpack the json strings
  for _, key in ipairs(DGCore.Config.Player.JSONData) do
    if playerData[key] then
      playerData[key] = json.decode(playerData[key])
    end
  end
  -- Import the charinfo into the table
  local charinfo = {
    firstname = '',
    lastname = '',
    birthdate = '',
    gender = '',
    nationality = '',
    phone = '',
    cash = '',
  }
  for k, _ in pairs(charinfo) do
    charinfo[k] = playerData[k]
    playerData[k] = nil
  end
  playerData.charinfo = charinfo
  return playerData
end

function DGCore.Player.Login(source, citizenid, newData)
  local src = source
  if not src then
    DGCore.ShowError(GetCurrentResourceName(), 'ERROR DGCORE.PLAYER.LOGIN - NO SOURCE GIVEN!')
    return false
  end

  if not citizenid then
    DGCore.Player.CheckPlayerData(src, newData)
    return true
  end

  local result = exports['dg-sql']:query([[
    SELECT *
    FROM users AS u
    JOIN all_character_data as cd ON cd.steamid = u.steamid
    WHERE cd.citizenid = ?
  ]], { citizenid })
  local PlayerData = DGCore.Player.buildPlayerData(result[1])
  if not PlayerData then
    DGX.Notifications.add('Kon karakter niet laden, probeer opnieuw', 'error')
    return false
  end

  DGCore.Player.CheckPlayerData(src, PlayerData)
  return true
end

function DGCore.Player.CheckPlayerData(src, PlayerData)
  if not PlayerData or not next(PlayerData) then
    DGCore.ShowError(GetCurrentResourceName(), 'ERROR DGCore.Player.CheckPlayerData - NO PLAYERDATA PROVIDED!')
    return
  end

  -- Character identifiers
  PlayerData.source = src
  PlayerData.citizenid = PlayerData.citizenid or nil
  PlayerData.steamid = not DGCore.Shared.isStringEmpty(PlayerData.steamid) and PlayerData.steamid or
      DGCore.Functions.GetIdentifier(src, 'steam')
  PlayerData.license = not DGCore.Shared.isStringEmpty(PlayerData.license) and PlayerData.license or
      DGCore.Functions.GetIdentifier(src, 'license')
  PlayerData.discord = not DGCore.Shared.isStringEmpty(PlayerData.discord) and PlayerData.discord or
      DGCore.Functions.GetIdentifier(src, "discord")
  PlayerData.name = GetPlayerName(src)

  -- Character info
  PlayerData.charinfo = PlayerData.charinfo or {}
  PlayerData.charinfo.firstname = PlayerData.charinfo.firstname or 'Firstname'
  PlayerData.charinfo.lastname = PlayerData.charinfo.lastname or 'Lastname'
  PlayerData.charinfo.birthdate = PlayerData.charinfo.birthdate or '01-01-2000'
  PlayerData.charinfo.gender = PlayerData.charinfo.gender or 0
  PlayerData.charinfo.nationality = PlayerData.charinfo.nationality or 'BELG'
  PlayerData.charinfo.phone = PlayerData.charinfo.phone or DGCore.Player.GeneratePhoneNumber()
  PlayerData.charinfo.cash = PlayerData.charinfo.cash or DGCore.Config.Money.defaultCash

  -- Character data
  PlayerData.position = PlayerData.position or DGConfig.DefaultSpawn

  print(json.encode(PlayerData.metadata))
  -- Metadata
  PlayerData.metadata = PlayerData.metadata or {}
  PlayerData.metadata.stress = PlayerData.metadata.stress or 0
  PlayerData.metadata.health = PlayerData.metadata.health ~= nil and PlayerData.metadata.health or 200
  PlayerData.metadata.armor = PlayerData.metadata.armor ~= nil and PlayerData.metadata.armor or 0
  PlayerData.metadata.callsign = PlayerData.metadata.callsign or 'NO CALLSIGN'
  PlayerData.metadata['licences'] = PlayerData.metadata['licences'] or {
    ['driver'] = true,
  }
  PlayerData.metadata['inside'] = PlayerData.metadata['inside'] or {
    house = nil,
    apartment = {
      id = nil,
    }
  }
  PlayerData.metadata.dna = PlayerData.metadata.dna or generateDNA()
  PlayerData.metadata.jailMonths = PlayerData.metadata.jailMonths or -1
  PlayerData.metadata.downState = PlayerData.metadata.downState or 'alive'
  PlayerData.metadata.needs = {
    hunger = PlayerData.metadata.needs ~= nil and PlayerData.metadata.needs.hunger or 100,
    thirst = PlayerData.metadata.needs ~= nil and PlayerData.metadata.needs.thirst or 100,
  }

  DGCore.Player.CreatePlayer(PlayerData)
end

-- On player logout

function DGCore.Player.Logout(source)
  local src = source
  local playerData =  DGCore.Functions.GetPlayer(src).PlayerData
  local citizenid = playerData.citizenid
  TriggerClientEvent('DGCore:client:playerUnloaded', src, citizenid)
  TriggerEvent('DGCore:server:playerUnloaded', src, citizenid, playerData)
  DGCore.Player.Save(src)
  Player(src).state:set('isLoggedIn', false, true)
  Player(src).state:set('cid', nil, true)
  Citizen.Wait(200)
  DGCore.Players[src] = nil
  DGCore.cidToPlyId[citizenid] = nil
end

-- Create a new character
-- Don't touch any of this unless you know what you are doing
-- Will cause major issues!

function DGCore.Player.CreatePlayer(PlayerData)
  local self = {}
  self.Functions = {}
  self.PlayerData = PlayerData

  self.Functions.UpdatePlayerData = function(reSeedCmds)
    TriggerClientEvent('DGCore:Player:SetPlayerData', self.PlayerData.source, self.PlayerData)
    if dontUpdateChat then
      exports['dg-chat']:refreshCommands(self.PlayerData.source)
    end
  end

  -- DONT EVERY USE THIS FUNCTIONS OUTSIDE CORE or I will personally beat you up - regards Nutty
  self.Functions.setCitizenid = function(cid)
    self.PlayerData.citizenid = cid
    self.Functions.UpdatePlayerData()
  end

  self.Functions.setCash = function(cash)
    self.PlayerData.charinfo.cash = cash
    self.Functions.UpdatePlayerData()
  end

  self.Functions.SetMetaData = function(meta, val)
    if val ~= nil then
      self.PlayerData.metadata[meta] = val
      self.Functions.UpdatePlayerData()
    end
  end

  self.Functions.Save = function()
    DGCore.Player.Save(self.PlayerData.source)
  end

  DGCore.Players[self.PlayerData.source] = self
  DGCore.Player.Save(self.PlayerData.source, true)

  -- Make the player state aware that we are loggedin
  Player(self.PlayerData.source).state:set('isLoggedIn', true, true)
  Player(self.PlayerData.source).state:set('steamId', self.PlayerData.steamid, true)
  if (self.PlayerData.citizenid) then
    Player(self.PlayerData.source).state:set('cid', self.PlayerData.citizenid, true)
    DGCore.cidToPlyId[self.PlayerData.citizenid] = self.PlayerData.source
  else
    print('CORE: DID NOT SET CID TO PLAYER STATE')
  end

  -- At this point we are safe to emit new instance to third party resource for load handling
  TriggerEvent('DGCore:server:playerLoaded', self.PlayerData)
  TriggerClientEvent('DGCore:client:playerLoaded', self.PlayerData.source, self.PlayerData)

  self.Functions.UpdatePlayerData()
end

-- Save player info to database (make sure citizenid is the primary key in your database)
function DGCore.Player.Save(src, skipHealth)
  local PlayerData = DGCore.Players[src].PlayerData

  if not PlayerData then
    DGCore.ShowError(GetCurrentResourceName(), 'ERROR DGCore.PLAYER.SAVE - PLAYERDATA IS EMPTY!')
    return
  end

  if not skipHealth then
    local ped = GetPlayerPed(src)
    local entHealth = math.max(GetEntityHealth(ped), 2)
    DGCore.Players[src].Functions.SetMetaData("health", entHealth)
    DGCore.Players[src].Functions.SetMetaData("armor", GetPedArmour(ped))
  end

  -- Save user
  local userResult = exports['dg-sql']:query([[
    INSERT INTO users (name, steamid, license, discord)
    VALUES (:name, :steamid, :license, :discord)
    ON DUPLICATE KEY UPDATE name    = :name,
                            steamid = :steamid,
                            license = :license,
                            discord = :discord;
  ]], {
    steamid = PlayerData.steamid,
    license = PlayerData.license,
    discord = PlayerData.discord,
    name = PlayerData.name,
  })

  if userResult.affectedRows < 1 then
    DGCore.ShowError(GetCurrentResourceName(), 'ERROR DGCore.PLAYER.SAVE - Failed to save user info in DB!')
    return
  end

  -- Save character
  local charResult = exports['dg-sql']:query([[
    INSERT INTO characters (citizenid, steamid)
    VALUES (:citizenid, :steamid)
    ON DUPLICATE KEY UPDATE citizenid = :citizenid, steamid = :steamid
    RETURNING citizenid
  ]], {
    steamid = PlayerData.steamid,
    citizenid = PlayerData.citizenid or 'undefined',
  })

  if charResult[1].citizenid == nil then
    DGCore.ShowError(GetCurrentResourceName(), 'ERROR DGCore.PLAYER.SAVE - Couldn\'t assign a valid citizenid!')
    return
  end

  if PlayerData.citizenid == nil then
    PlayerData.citizenid = charResult[1].citizenid
    DGCore.Players[src].Functions.setCitizenid(PlayerData.citizenid)
  end

  -- Save character data
  local position = exports['dg-sync']:getPlayerCoords(src) or PlayerData.position
  local charDataResult = exports['dg-sql']:query([[
    INSERT INTO character_data (citizenid, position, metadata)
    VALUES (:citizenid, :position, :metadata)
    ON DUPLICATE KEY UPDATE position = :position,
                            metadata = :metadata;
  ]], {
    citizenid = PlayerData.citizenid,
    position = json.encode(position),
    metadata = json.encode(PlayerData.metadata),
  })

  if charDataResult.affectedRows < 1 then
    DGCore.ShowError(GetCurrentResourceName(), 'ERROR DGCore.PLAYER.SAVE - Failed to save character data in DB!')
    return
  end

  -- Save character info
  local charInfoResult = exports['dg-sql']:query([[
    INSERT INTO character_info (citizenid, firstname, lastname, birthdate, gender, nationality, phone, cash)
    VALUES (:citizenid, :firstname, :lastname, :birthdate, :gender, :nationality, :phone, :cash)
    ON DUPLICATE KEY UPDATE firstname = :firstname,
                            lastname = :lastname,
                            birthdate = :birthdate,
                            gender = :gender,
                            nationality = :nationality,
                            phone = :phone,
                            cash = :cash;
  ]], {
    citizenid = PlayerData.citizenid,
    firstname = PlayerData.charinfo.firstname,
    lastname = PlayerData.charinfo.lastname,
    birthdate = PlayerData.charinfo.birthdate,
    gender = PlayerData.charinfo.gender,
    nationality = PlayerData.charinfo.nationality,
    phone = PlayerData.charinfo.phone,
    cash = PlayerData.charinfo.cash
  })

  if charInfoResult.affectedRows < 1 then
    DGCore.ShowError(GetCurrentResourceName(), 'ERROR DGCore.PLAYER.SAVE - Failed to save character info in DB!')
    return
  end

  DGCore.ShowSuccess(GetCurrentResourceName(), PlayerData.name .. ' PLAYER SAVED!')
end

-- Delete character
function DGCore.Player.DeleteCharacter(source, citizenid)
  local src = source
  local steamid = DGCore.Functions.GetIdentifier(src, 'steam')
  local result = exports['dg-sql']:scalar('SELECT steamid FROM characters WHERE citizenid = ?', { citizenid })
  if steamid == result.steamid then
    exports['dg-sql']:query('DELETE FROM characters WHERE citizenid = ?', { citizenid })
    TriggerEvent('qb-log:server:CreateLog', 'joinleave', 'Character Deleted', 'red',
      '**' .. GetPlayerName(src) .. '** ' .. steamid .. ' deleted **' .. citizenid .. '**..')
  else
    DropPlayer(src, 'You Have Been Kicked For Exploitation')
    TriggerEvent('qb-log:server:CreateLog', 'anticheat', 'Anti-Cheat', 'white',
      GetPlayerName(src) .. ' Has Been Dropped For Character Deletion Exploit', false)
  end
end

-- Util Functions

function generateDNA()
  local uniqueFound = false
  local dna
  while not uniqueFound do
    dna = tostring(DGCore.Shared.RandomStr(2)..DGCore.Shared.RandomInt(3)..DGCore.Shared.RandomStr(1)..DGCore.Shared.RandomInt(2)..DGCore.Shared.RandomStr(3)..DGCore.Shared.RandomInt(4))
    local query = '%'..dna..'%'
    local result = DGX.SQL.query('SELECT COUNT(*) as count FROM character_data WHERE `metadata` LIKE ?', { query })
    if result[1].count == 0 then
      uniqueFound = true
    end
  end
  return dna
end

function DGCore.Player.GeneratePhoneNumber()
  while true do
    local phone = '04' .. math.random(70, 99) .. math.random(11, 99) .. math.random(11, 99) .. math.random(11, 99)
    local result = exports['dg-sql']:query('SELECT COUNT(*) as count FROM character_info WHERE phone = ?', { phone })
    if result[1].count == 0 then
      return phone
    end
    Citizen.Wait(100)
  end
end

exports('GetOfflinePlayerByCitizenId', DGCore.Functions.GetOfflinePlayerByCitizenId)
