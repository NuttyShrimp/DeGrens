-- Event Handler

AddEventHandler('playerDropped', function()
	local src = source
	if DGCore.Players[src] then
		local Player = DGCore.Players[src]
		TriggerEvent('qb-log:server:CreateLog', 'joinleave', 'Dropped', 'red', '**' .. GetPlayerName(src) .. '** (' .. Player.PlayerData.license .. ') left..')
		Player.Functions.Save()
		TriggerEvent('DGCore:Server:OnPlayerUnload', src, Player.PlayerData.citizenid)
		DGCore.Players[src] = nil
	end
end)

-- Player Connecting

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

	local isBanned, Reason = DGCore.Functions.IsPlayerBanned(player)
	if isBanned then
		deferrals.done(Reason)
		return false
	end

	local isLicenseAlreadyInUse = DGCore.Functions.IsLicenseInUse(license)
	if isLicenseAlreadyInUse and GetConvar('is_production', 'true') == "true" then
		deferrals.done('Duplicate Rockstar License Found')
		return false
	end

	deferrals.update(string.format('Welcome %s to DeGrens.', name))

	deferrals.done()
	TriggerEvent('connectqueue:playerConnect', name, setKickReason, deferrals)
end

AddEventHandler('playerConnecting', OnPlayerConnecting)

-- Open & Close Server (prevents players from joining)

RegisterNetEvent('DGCore:server:CloseServer', function(reason)
	local src = source
	if DGCore.Functions.HasPermission(src, 'admin') or DGCore.Functions.HasPermission(src, 'god') then
		local reason = reason or 'No reason specified'
		DGCore.Config.Server.closed = true
		DGCore.Config.Server.closedReason = reason
		TriggerClientEvent('qbadmin:client:SetServerStatus', -1, true)
	else
		DGCore.Functions.Kick(src, 'You don\'t have permissions for this..', nil, nil)
	end
end)

RegisterNetEvent('DGCore:server:OpenServer', function()
	local src = source
	if DGCore.Functions.HasPermission(src, 'admin') or DGCore.Functions.HasPermission(src, 'god') then
		DGCore.Config.Server.closed = false
		TriggerClientEvent('qbadmin:client:SetServerStatus', -1, false)
	else
		DGCore.Functions.Kick(src, 'You don\'t have permissions for this..', nil, nil)
	end
end)

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

RegisterNetEvent('DGCore:UpdatePlayer', function()
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	if Player then
		local newHunger = Player.PlayerData.metadata['hunger'] - DGCore.Config.Player.HungerRate
		local newThirst = Player.PlayerData.metadata['thirst'] - DGCore.Config.Player.ThirstRate
		if newHunger <= 0 then
			newHunger = 0
		end
		if newThirst <= 0 then
			newThirst = 0
		end
		Player.Functions.SetMetaData('thirst', newThirst)
		Player.Functions.SetMetaData('hunger', newHunger)
		TriggerClientEvent('hud:client:UpdateNeeds', src, newHunger, newThirst)
		Player.Functions.Save()
	end
end)

RegisterNetEvent('DGCore:Server:SetMetaData', function(meta, data)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	if meta == 'hunger' or meta == 'thirst' then
		if data > 100 then
			data = 100
		end
	end
	if Player then
		Player.Functions.SetMetaData(meta, data)
	end
	TriggerClientEvent('hud:client:UpdateNeeds', src, Player.PlayerData.metadata['hunger'], Player.PlayerData.metadata['thirst'])
end)

-- Non-Chat Command Calling (ex: qb-adminmenu)

RegisterNetEvent('DGCore:CallCommand', function(command, args)
	local src = source
	if DGCore.Commands.List[command] then
		local Player = DGCore.Functions.GetPlayer(src)
		if Player then
			local isGod = DGCore.Functions.HasPermission(src, 'god')
			local hasPerm = DGCore.Functions.HasPermission(src, DGCore.Commands.List[command].permission)
			local isPrincipal = IsPlayerAceAllowed(src, 'command')
			if isGod or hasPerm or isPrincipal then
				if (DGCore.Commands.List[command].argsrequired and #DGCore.Commands.List[command].arguments ~= 0 and args[#DGCore.Commands.List[command].arguments] == nil) then
					TriggerClientEvent('DGCore:Notify', src, 'All arguments must be filled out!', 'error')
				else
					DGCore.Commands.List[command].callback(src, args)
				end
			else
				TriggerClientEvent('DGCore:Notify', src, 'No Access To This Command', 'error')
			end
		end
	end
end)