-- Event Handler
AddEventHandler('playerDropped', function(reason)
	local src = source
	if DGCore.Players[src] then
		local Player = DGCore.Players[src]
    local cid = Player.PlayerData.citizenid
		TriggerEvent('qb-log:server:CreateLog', 'joinleave', 'Dropped', 'red', '**' .. GetPlayerName(src) .. '** (' .. Player.PlayerData.license .. ') left..')
		Player.Functions.Save()
		TriggerEvent('DGCore:server:playerUnloaded', src, cid, Player.PlayerData)
    exports['dg-chars']:addDroppedPlayer(cid)
		DGCore.Players[src] = nil
    DGCore.cidToPlyId[cid] = nil
	end
end)

-- Player Connecting

function deferralMessage(message)
  return message .. '\n🔸 Check our Discord for further information: ' .. DGCore.Config.Server.discord
end

-- TODO: Move everything to queue system
local function OnPlayerConnecting(name, setKickReason, deferrals)
	local player = source
	local license
	local steamId
	local identifiers = GetPlayerIdentifiers(player)
	deferrals.defer()

	-- mandatory wait!
	Wait(0)

	deferrals.update(string.format('Hello %s. Validating Your Rockstar License', name))

	for _, v in pairs(identifiers) do
		if string.find(v, 'license') then
			license = v
			break
		end
	end

	if not license then
		deferrals.done('No Valid Rockstar License Found')
		return false
	end

	deferrals.update(string.format('Hello %s. Validating Your Steam Account', name))

	for _, v in pairs(identifiers) do
		if string.find(v, 'steam') then
			steamId = v
			break
		end
	end

	if not steamId then
		deferrals.done('No Valid Steam Account Found')
		return false
	end

	deferrals.update(string.format('Hello %s. We are checking if you are banned.', name))

	local banInfo = exports['dg-admin']:isPlayerBanned(steamId)
	if banInfo.isBanned then
		deferrals.done(banInfo.reason)
		return false
	end

	local isLicenseAlreadyInUse = DGCore.Functions.IsLicenseInUse(license)
	if isLicenseAlreadyInUse and GetConvar('is_production', 'true') == "true" then
		deferrals.done('Duplicate Rockstar License Found')
		return false
	end
	
  deferrals.update(string.format('Hallo %s. We zijn aan het controleren of je geallowlist bent.', name))
  local isWhitelisted = exports['dg-admin']:isPlayerWhitelisted(player)
  if not isWhitelisted then
    deferrals.done(deferralMessage('Je bent niet geallowlist. Join onze discord om intake gesprek te voeren!'))
    return false
  end

	deferrals.update(string.format('Welcome %s to DeGrens.', name))

	deferrals.done()
	TriggerEvent('connectqueue:playerConnect', player, name, setKickReason, deferrals)
end

AddEventHandler('playerConnecting', OnPlayerConnecting)

-- Callbacks

RegisterNetEvent('DGCore:Server:TriggerCallback', function(name, ...)
	local src = source
	DGCore.Functions.TriggerCallback(name, src, function(...)
		TriggerClientEvent('DGCore:Client:TriggerCallback', src, name, ...)
	end, ...)
end)

RegisterNetEvent('DGCore:server:TriggerPromiseCallback', function(name, callId, ...)
	local src = source
	DGCore.Functions.TriggerCallback(name, src, function(...)
		TriggerClientEvent('DGCore:Client:TriggerPromiseCallback', src, callId, ...)
	end, ...)
end)

-- Player

RegisterNetEvent('DGCore:server:save', function()
  local src = source
  DGCore.Player.Save(src)
end)

exports("GetPlayer", DGCore.Functions.GetPlayer)