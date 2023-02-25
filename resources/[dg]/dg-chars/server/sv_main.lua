local activeInstances = {}

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
  local instanceId = 1000 + source -- This instead of the getfreeinstance shit that did not work, no one will ever see eachother by using serverid
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
    DGX.Util.Log('chars:select', { citizenid = cid }, ("%s (%d | %d) loaded.."):format(DGX.Util.getName(src), cid, src), src)
	end

  local ply = DGCore.Functions.GetPlayer(src)
	cb(ply.PlayerData)
end)

DGCore.Functions.CreateCallback('dg-chars:server:createCharacter', function(src, cb, data)
	local newData = {}
	newData.charinfo = data
	if DGCore.Player.Login(src, false, newData) then
		DGCore.ShowSuccess(GetCurrentResourceName(), ('%s is creating a new character!'):format(GetPlayerName(src)))
    exports['dg-chat']:refreshCommands(src)
    DGX.Util.Log('chars:created', { data = data }, ("%s (%d) is creating a new character (%s %s)"):format(DGX.Util.getName(plyId), src, data.firstname, data.lastname), src)
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
DGX.Events.onNet('chars:server:logOut', function(src)
  logOut(src)
end)
