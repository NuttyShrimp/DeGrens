DGCore.Players = {}
DGCore.Player = {}

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
  PlayerData.position = PlayerData.position or QBConfig.DefaultSpawn

  -- Metadata
  PlayerData.metadata = PlayerData.metadata or {}
  PlayerData.metadata['hunger'] = PlayerData.metadata['hunger'] or 100
  PlayerData.metadata['thirst'] = PlayerData.metadata['thirst'] or 100
  PlayerData.metadata['stress'] = PlayerData.metadata['stress'] or 0
  PlayerData.metadata['isdead'] = PlayerData.metadata['isdead'] or false
  PlayerData.metadata['inlaststand'] = PlayerData.metadata['inlaststand'] or false
  PlayerData.metadata['armor'] = PlayerData.metadata['armor'] or 0
  PlayerData.metadata['ishandcuffed'] = PlayerData.metadata['ishandcuffed'] or false
  PlayerData.metadata['tracker'] = PlayerData.metadata['tracker'] or false
  PlayerData.metadata['injail'] = PlayerData.metadata['injail'] or 0
  PlayerData.metadata['jailitems'] = PlayerData.metadata['jailitems'] or {}
  PlayerData.metadata['status'] = PlayerData.metadata['status'] or {}
  PlayerData.metadata['fitbit'] = PlayerData.metadata['fitbit'] or {}
  PlayerData.metadata['commandbinds'] = PlayerData.metadata['commandbinds'] or {}
  PlayerData.metadata['bloodtype'] = PlayerData.metadata['bloodtype'] or
      DGCore.Config.Player.Bloodtypes[math.random(1, #DGCore.Config.Player.Bloodtypes)]
  PlayerData.metadata['craftingrep'] = PlayerData.metadata['craftingrep'] or 0
  PlayerData.metadata['attachmentcraftingrep'] = PlayerData.metadata['attachmentcraftingrep'] or 0
  PlayerData.metadata['jobrep'] = PlayerData.metadata['jobrep'] or {
    ['tow'] = 0,
    ['trucker'] = 0,
    ['taxi'] = 0,
    ['hotdog'] = 0,
  }
  PlayerData.metadata['callsign'] = PlayerData.metadata['callsign'] or 'NO CALLSIGN'
  PlayerData.metadata['fingerprint'] = PlayerData.metadata['fingerprint'] or DGCore.Player.CreateFingerId()
  PlayerData.metadata['criminalrecord'] = PlayerData.metadata['criminalrecord'] or {
    ['hasRecord'] = false,
    ['date'] = nil
  }
  PlayerData.metadata['licences'] = PlayerData.metadata['licences'] or {
    ['driver'] = true,
    ['business'] = false,
    ['weapon'] = false
  }
  PlayerData.metadata['inside'] = PlayerData.metadata['inside'] or {
    house = nil,
    apartment = {
      id = nil,
    }
  }

  DGCore.Player.CreatePlayer(PlayerData)
end

-- On player logout

function DGCore.Player.Logout(source)
  local src = source
  local citizenid = DGCore.Functions.GetPlayer(src).PlayerData.citizenid
  TriggerClientEvent('DGCore:client:playerUnloaded', src, citizenid)
  TriggerEvent('DGCore:server:playerUnloaded', src, citizenid)
  DGCore.Player.Save(src)
  Player(self.PlayerData.source).state:set('isLoggedIn', false, true)
  Player(self.PlayerData.source).state:set('cid', nil, true)
  Citizen.Wait(200)
  DGCore.Players[src] = nil
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
    local meta = meta:lower()
    if val ~= nil then
      self.PlayerData.metadata[meta] = val
      self.Functions.UpdatePlayerData()
    end
  end

  self.Functions.Save = function()
    DGCore.Player.Save(self.PlayerData.source)
  end

  DGCore.Players[self.PlayerData.source] = self
  DGCore.Player.Save(self.PlayerData.source)

  -- Make the player state aware that we are loggedin
  Player(self.PlayerData.source).state:set('isLoggedIn', true, true)
  Player(self.PlayerData.source).state:set('steamId', self.PlayerData.steamid, true)
  if (self.PlayerData.citizenid) then
    Player(self.PlayerData.source).state:set('cid', self.PlayerData.citizenid, true)
  end

  -- At this point we are safe to emit new instance to third party resource for load handling
  TriggerEvent('DGCore:server:playerLoaded', self.PlayerData)
  TriggerClientEvent('DGCore:client:playerLoaded', self.PlayerData.source, self.PlayerData)

  self.Functions.UpdatePlayerData()
end

-- Save player info to database (make sure citizenid is the primary key in your database)
function DGCore.Player.Save(src)
  local PlayerData = DGCore.Players[src].PlayerData

  if not PlayerData then
    DGCore.ShowError(GetCurrentResourceName(), 'ERROR DGCore.PLAYER.SAVE - PLAYERDATA IS EMPTY!')
    return
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
  -- TODO: Move to dg-sync player locations cache
  local position = Player(src).state.isLoggedIn and GetEntityCoords(GetPlayerPed(src)) or PlayerData.position
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

local playertables = { -- Add tables as needed
  { table = 'characters' },
  { table = 'character_data' },
  { table = 'character_info' },
  { table = 'apartments' },
  { table = 'crypto_transactions' },
  { table = 'phone_invoices' },
  { table = 'phone_messages' },
  { table = 'playerskins' },
  { table = 'player_boats' },
  { table = 'player_contacts' },
  { table = 'player_houses' },
  { table = 'player_mails' },
  { table = 'player_outfits' },
  { table = 'player_vehicles' }
}

function DGCore.Player.DeleteCharacter(source, citizenid)
  local src = source
  local steamid = DGCore.Functions.GetIdentifier(src, 'steam')
  local result = exports['dg-sql']:scalar('SELECT steamid FROM characters where citizenid = ?', { citizenid })
  if steamid == result then
    for k, v in pairs(playertables) do
      exports['dg-sql']:query('DELETE FROM ' .. v.table .. ' WHERE citizenid = ?', { citizenid })
    end
    TriggerEvent('qb-log:server:CreateLog', 'joinleave', 'Character Deleted', 'red',
      '**' .. GetPlayerName(src) .. '** ' .. steamid .. ' deleted **' .. citizenid .. '**..')
  else
    DropPlayer(src, 'You Have Been Kicked For Exploitation')
    TriggerEvent('qb-log:server:CreateLog', 'anticheat', 'Anti-Cheat', 'white',
      GetPlayerName(src) .. ' Has Been Dropped For Character Deletion Exploit', false)
  end
end

-- Util Functions

function DGCore.Player.CreateFingerId()
  local UniqueFound = false
  local FingerId = nil
  while not UniqueFound do
    FingerId = tostring(DGCore.Shared.RandomStr(2) ..
      DGCore.Shared.RandomInt(3) ..
      DGCore.Shared.RandomStr(1) ..
      DGCore.Shared.RandomInt(2) .. DGCore.Shared.RandomStr(3) .. DGCore.Shared.RandomInt(4))
    local query = '%' .. FingerId .. '%'
    local result = exports['dg-sql']:query('SELECT COUNT(*) as count FROM character_data WHERE `metadata` LIKE ?', { query })
    if result[1].count == 0 then
      UniqueFound = true
    end
  end
  return FingerId
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
