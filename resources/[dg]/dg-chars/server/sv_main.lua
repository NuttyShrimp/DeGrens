local activeInstances = {}

-- Get a newInstanceID close to 1000 as possible\
local function getFreeInstance()
  local isFree = false
  local currentId = 1000
  while not isFree do
    if not activeInstances[currentId] then
      isFree = true
      break
    end
    currentId = currentId + 1
  end
  return currentId
end

-- TODO: Remove this garbage from char selection and implement in resource self
-- TODO of TODO: Only implement when we actually have our own housing system
-- local function loadHouseData()
-- 	local HouseGarages = {}
-- 	local Houses = {}
-- 	local result = exports['dg-sql']:query('SELECT * FROM houselocations', {})
-- 	if result[1] ~= nil then
-- 		for k, v in pairs(result) do
-- 			local owned = false
-- 			if tonumber(v.owned) == 1 then
-- 				owned = true
-- 			end
-- 			local garage = v.garage ~= nil and json.decode(v.garage) or {}
-- 			Houses[v.name] = {
-- 				coords = json.decode(v.coords),
-- 				owned = v.owned,
-- 				price = v.price,
-- 				locked = true,
-- 				adress = v.label,
-- 				tier = v.tier,
-- 				garage = garage,
-- 				decorations = {},
-- 			}
-- 			HouseGarages[v.name] = {
-- 				label = v.label,
-- 				takeVehicle = garage,
-- 			}
-- 		end
-- 	end
-- 	TriggerClientEvent("qb-garages:client:houseGarageConfig", -1, HouseGarages)
-- 	TriggerClientEvent("qb-houses:client:setHouseConfig", -1, Houses)
-- end

RegisterNetEvent('dg-chars:server:newCharSpawn', function()
	local src = source
  DGX.Inventory.giveStarterItems(src)
	exports['dg-apartments']:enterApartment(src)
end)

DGCore.Functions.CreateCallback('dg-chars:server:setupClient', function(source, cb)
  -- Give the client time to create all polyzones
  Wait(1000)
  local instanceId = getFreeInstance()
  exports['dg-lib']:setInstance(source, instanceId)
  exports['dg-lib']:setInstanceName(instanceId, 'char-selection-'..GetPlayerName(source))
  cb()
end)

DGCore.Functions.CreateCallback('dg-chars:server:getChars', function(src, cb)
  local steamid = DGCore.Functions.GetIdentifier(src, 'steam')
	local chars = {}
	local result = exports['dg-sql']:query([[
		SELECT p.citizenid, p.firstname, p.lastname, ps.model, ps.skin
		FROM all_character_data p
			INNER JOIN playerskins ps on p.citizenid = ps.citizenid AND ps.active = 1
    WHERE steamid = ?
	]], { steamid })
	for k, v in ipairs(result) do
		v.model = tonumber(v.model)
		chars[k] = v
	end
	cb(chars)
end)

DGCore.Functions.CreateCallback('dg-chars:server:deleteCharacter', function(src, cb, cid)
	DGCore.Player.DeleteCharacter(src, cid)
	cb()
end)

DGCore.Functions.CreateCallback('dg-chars:server:loadPly', function(src, cb, cid)
	if DGCore.Player.Login(src, cid) then
		DGCore.ShowSuccess(GetCurrentResourceName(), ('%s (Citizen ID: %s) has successfully been loaded!'):format(GetPlayerName(src), cid))
    exports['dg-chat']:refreshCommands(src)
		-- loadHouseData()
		exports['dg-logs']:createGraylogEntry('join', { src, cid }, ("%s (%s | %d) loaded.."):format(GetPlayerName(src), cid, src))
	end
	cb()
end)

DGCore.Functions.CreateCallback('dg-chars:server:createCharacter', function(src, cb, data)
	local newData = {}
	newData.charinfo = data
	if DGCore.Player.Login(src, false, newData) then
    exports['dg-chat']:refreshCommands(src)
		exports['dg-logs']:createGraylogEntry('chars:created', { src, data }, "Created a new character")
		TriggerClientEvent('qb-clothes:client:CreateFirstCharacter', src)
	end
	cb()
end)

local logOut = function(plyId)
  DGCore.Player.Logout(plyId)
  TriggerClientEvent('chars:client:logOut', plyId)
  DGX.Util.Log('chars:logout', {plyId}, ('%s has logged out to switch characters'):format(DGX.Util.getName(plyId)))
end
exports('logOut', logOut)
