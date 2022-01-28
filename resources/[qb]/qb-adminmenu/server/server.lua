-- Variables
local DGCore = exports['dg-core']:GetCoreObject()
local frozen = false
local permissions = {
	['kill'] = 'god',
	['ban'] = 'admin',
	['noclip'] = 'admin',
	['kickall'] = 'admin',
	['kick'] = 'admin'
}

-- Get Dealers
DGCore.Functions.CreateCallback('test:getdealers', function(source, cb)
	cb(exports['qb-drugs']:GetDealers())
end)

-- Get Players
DGCore.Functions.CreateCallback('test:getplayers', function(source, cb)
	-- WORKS
	local players = {}
	for k, v in pairs(DGCore.Functions.GetPlayers()) do
		local targetped = GetPlayerPed(v)
		local ped = DGCore.Functions.GetPlayer(v)
		table.insert(players, {
			name = ped.PlayerData.charinfo.firstname .. ' ' .. ped.PlayerData.charinfo.lastname .. ' | (' .. GetPlayerName(v) .. ')',
			id = v,
			coords = GetEntityCoords(targetped),
			cid = ped.PlayerData.charinfo.firstname .. ' ' .. ped.PlayerData.charinfo.lastname,
			citizenid = ped.PlayerData.citizenid,
			sources = GetPlayerPed(ped.PlayerData.source),
			sourceplayer = ped.PlayerData.source

		})
	end
	cb(players)
end)

DGCore.Functions.CreateCallback('qb-admin:server:getrank', function(source, cb)
	local src = source
	if DGCore.Functions.HasPermission(src, 'god') or IsPlayerAceAllowed(src, 'command') then
		cb(true)
	else
		cb(false)
	end
end)

-- Functions

local function tablelength(table)
	local count = 0
	for _ in pairs(table) do
		count = count + 1
	end
	return count
end

-- Events

RegisterNetEvent('qb-admin:server:GetPlayersForBlips', function()
	local src = source
	local players = {}
	for k, v in pairs(DGCore.Functions.GetPlayers()) do
		local targetped = GetPlayerPed(v)
		local ped = DGCore.Functions.GetPlayer(v)
		table.insert(players, {
			name = ped.PlayerData.charinfo.firstname .. ' ' .. ped.PlayerData.charinfo.lastname .. ' | ' .. GetPlayerName(v),
			id = v,
			coords = GetEntityCoords(targetped),
			cid = ped.PlayerData.charinfo.firstname .. ' ' .. ped.PlayerData.charinfo.lastname,
			citizenid = ped.PlayerData.citizenid,
			sources = GetPlayerPed(ped.PlayerData.source),
			sourceplayer = ped.PlayerData.source
		})
	end
	TriggerClientEvent('qb-admin:client:Show', src, players)
end)

RegisterNetEvent('qb-admin:server:kill', function(player)
	TriggerClientEvent('hospital:client:KillPlayer', player.id)
end)

RegisterNetEvent('qb-admin:server:revive', function(player)
	TriggerClientEvent('hospital:client:Revive', player.id)
end)

RegisterNetEvent('qb-admin:server:kick', function(player, reason)
	local src = source
	if DGCore.Functions.HasPermission(src, permissions['kick']) or IsPlayerAceAllowed(src, 'command') then
		TriggerEvent('qb-log:server:CreateLog', 'bans', 'Player Kicked', 'red', string.format('%s was kicked by %s for %s', GetPlayerName(player.id), GetPlayerName(src), reason), true)
		DropPlayer(player.id, 'You have been kicked from the server:\n' .. reason .. '\n\n🔸 Check our Discord for more information: ' .. DGCore.Config.Server.discord)
	end
end)

RegisterNetEvent('qb-admin:server:ban', function(player, time, reason)
	local src = source
	if DGCore.Functions.HasPermission(src, permissions['ban']) or IsPlayerAceAllowed(src, 'command') then
		local time = tonumber(time)
		local banTime = tonumber(os.time() + time)
		if banTime > 2147483647 then
			banTime = 2147483647
		end
		local timeTable = os.date('*t', banTime)
		exports.oxmysql:insert('INSERT INTO bans (name, steamid, license, discord, ip, reason, expire, bannedby) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', {
			GetPlayerName(player.id),
			DGCore.Functions.GetIdentifier(player.id, 'steam'),
			DGCore.Functions.GetIdentifier(player.id, 'license'),
			DGCore.Functions.GetIdentifier(player.id, 'discord'),
			DGCore.Functions.GetIdentifier(player.id, 'ip'),
			reason,
			banTime,
			GetPlayerName(src)
		})
		TriggerClientEvent('chat:addMessage', -1, {
			template = "<strong>ANNOUNCEMENT | {0} has been banned:</strong> {1}",
			color = "emergency",
			args = { GetPlayerName(player.id), reason }
		})
		TriggerEvent('qb-log:server:CreateLog', 'bans', 'Player Banned', 'red', string.format('%s was banned by %s for %s', GetPlayerName(player.id), GetPlayerName(src), reason), true)
		if banTime >= 2147483647 then
			DropPlayer(player.id, 'You have been banned:\n' .. reason .. '\n\nYour ban is permanent.\n🔸 Check our Discord for more information: ' .. DGCore.Config.Server.discord)
		else
			DropPlayer(player.id, 'You have been banned:\n' .. reason .. '\n\nBan expires: ' .. timeTable['day'] .. '/' .. timeTable['month'] .. '/' .. timeTable['year'] .. ' ' .. timeTable['hour'] .. ':' .. timeTable['min'] .. '\n🔸 Check our Discord for more information: ' .. DGCore.Config.Server.discord)
		end
	end
end)

RegisterNetEvent('qb-admin:server:spectate')
AddEventHandler('qb-admin:server:spectate', function(player)
	local src = source
	local targetped = GetPlayerPed(player.id)
	local coords = GetEntityCoords(targetped)
	TriggerClientEvent('qb-admin:client:spectate', src, player.id, coords)
end)

RegisterNetEvent('qb-admin:server:freeze')
AddEventHandler('qb-admin:server:freeze', function(player)
	local target = GetPlayerPed(player.id)
	if not frozen then
		frozen = true
		FreezeEntityPosition(target, true)
	else
		frozen = false
		FreezeEntityPosition(target, false)
	end
end)

RegisterNetEvent('qb-admin:server:goto', function(player)
	local src = source
	local admin = GetPlayerPed(src)
	local coords = GetEntityCoords(GetPlayerPed(player.id))
	SetEntityCoords(admin, coords)
end)

RegisterNetEvent('qb-admin:server:intovehicle', function(player)
	local src = source
	local admin = GetPlayerPed(src)
	-- local coords = GetEntityCoords(GetPlayerPed(player.id))
	local targetPed = GetPlayerPed(player.id)
	local vehicle = GetVehiclePedIsIn(targetPed, false)
	local seat = -1
	if vehicle ~= 0 then
		for i = 0, 8, 1 do
			if GetPedInVehicleSeat(vehicle, i) == 0 then
				seat = i
				break
			end
		end
		if seat ~= -1 then
			SetPedIntoVehicle(admin, vehicle, seat)
			TriggerClientEvent('DGCore:Notify', src, 'Entered vehicle', 'success', 5000)
		else
			TriggerClientEvent('DGCore:Notify', src, 'The vehicle has no free seats!', 'danger', 5000)
		end
	end
end)

RegisterNetEvent('qb-admin:server:bring', function(player)
	local src = source
	local admin = GetPlayerPed(src)
	local coords = GetEntityCoords(admin)
	local target = GetPlayerPed(player.id)
	SetEntityCoords(target, coords)
end)

RegisterNetEvent('qb-admin:server:inventory', function(player)
	local src = source
	TriggerClientEvent('qb-admin:client:inventory', src, player.id)
end)

RegisterNetEvent('qb-admin:server:cloth', function(player)
	TriggerClientEvent('qb-clothing:client:openMenu', player.id)
end)

RegisterNetEvent('qb-admin:server:setPermissions', function(targetId, group)
	local src = source
	if DGCore.Functions.HasPermission(src, 'god') or IsPlayerAceAllowed(src, 'command') then
		DGCore.Functions.AddPermission(targetId, group[1].rank)
		TriggerClientEvent('DGCore:Notify', targetId, 'Your Permission Level Is Now ' .. group[1].label)
	end
end)

RegisterNetEvent('qb-admin:server:SendReport', function(name, targetSrc, msg)
	local src = source
	if DGCore.Functions.HasPermission(src, 'admin') or IsPlayerAceAllowed(src, 'command') then
		if DGCore.Functions.IsOptin(src) then
			TriggerClientEvent('chat:addMessage', src, {
				author = 'REPORT - ' .. name .. ' (' .. targetSrc .. ')',
				color = 'report',
				message = msg
			})
		end
	end
end)

RegisterNetEvent('qb-admin:server:StaffChatMessage', function(name, msg)
	local src = source
	if DGCore.Functions.HasPermission(src, 'admin') or IsPlayerAceAllowed(src, 'command') then
		if DGCore.Functions.IsOptin(src) then
			TriggerClientEvent('chat:addMessage', src, {
				author = 'STAFFCHAT - ' .. name,
				color = 'error',
				message = msg
			})
		end
	end
end)

RegisterNetEvent('qb-admin:server:SaveCar', function(mods, vehicle, hash, plate)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	local result = exports.oxmysql:executeSync('SELECT plate FROM player_vehicles WHERE plate = ?', { plate })
	if result[1] == nil then
		exports.oxmysql:insert('INSERT INTO player_vehicles (license, citizenid, vehicle, hash, mods, plate, state) VALUES (?, ?, ?, ?, ?, ?, ?)', {
			Player.PlayerData.license,
			Player.PlayerData.citizenid,
			vehicle.model,
			vehicle.hash,
			json.encode(mods),
			plate,
			0
		})
		TriggerClientEvent('DGCore:Notify', src, 'The vehicle is now yours!', 'success', 5000)
	else
		TriggerClientEvent('DGCore:Notify', src, 'This vehicle is already yours..', 'error', 3000)
	end
end)

-- Commands

DGCore.Commands.Add('blips', 'Show blips for players (Admin Only)', {}, false, function(source, args)
	TriggerClientEvent('qb-admin:client:toggleBlips', source)
end, 'admin')

DGCore.Commands.Add('names', 'Show player name overhead (Admin Only)', {}, false, function(source, args)
	TriggerClientEvent('qb-admin:client:toggleNames', source)
end, 'admin')

DGCore.Commands.Add('coords', 'Enable coord display for development stuff (Admin Only)', {}, false, function(source, args)
	TriggerClientEvent('qb-admin:client:ToggleCoords', source)
end, 'admin')

DGCore.Commands.Add('admincar', 'Save Vehicle To Your Garage (Admin Only)', {}, false, function(source, args)
	local ply = DGCore.Functions.GetPlayer(source)
	TriggerClientEvent('qb-admin:client:SaveCar', source)
end, 'admin')

DGCore.Commands.Add('announce', 'Make An Announcement (Admin Only)', {}, false, function(source, args)
	local msg = table.concat(args, ' ')
	for i = 1, 3, 1 do
		TriggerClientEvent('chat:addMessage', -1, {
			author = 'SYSTEM',
			color = 'error',
			message = msg
		})
	end
end, 'admin')

DGCore.Commands.Add('admin', 'Open Admin Menu (Admin Only)', {}, false, function(source, args)
	TriggerClientEvent('qb-admin:client:openMenu', source)
end, 'admin')

DGCore.Commands.Add('report', 'Admin Report', { { name = 'message', help = 'Message' } }, true, function(source, args)
	local msg = table.concat(args, ' ')
	local Player = DGCore.Functions.GetPlayer(source)
	TriggerClientEvent('qb-admin:client:SendReport', -1, GetPlayerName(source), source, msg)
	TriggerClientEvent('chat:addMessage', source, {
		author = 'REPORT Send',
		message = msg,
		color = 'normal'
	})
	TriggerEvent('qb-log:server:CreateLog', 'report', 'Report', 'green', '**' .. GetPlayerName(source) .. '** (CitizenID: ' .. Player.PlayerData.citizenid .. ' | ID: ' .. source .. ') **Report:** ' .. msg, false)
end)

DGCore.Commands.Add('staffchat', 'Send A Message To All Staff (Admin Only)', { { name = 'message', help = 'Message' } }, true, function(source, args)
	local msg = table.concat(args, ' ')
	TriggerClientEvent('qb-admin:client:SendStaffChat', -1, GetPlayerName(source), msg)
end, 'admin')

DGCore.Commands.Add('givenuifocus', 'Give A Player NUI Focus (Admin Only)', { { name = 'id', help = 'Player id' }, { name = 'focus', help = 'Set focus on/off' }, { name = 'mouse', help = 'Set mouse on/off' } }, true, function(source, args)
	local playerid = tonumber(args[1])
	local focus = args[2]
	local mouse = args[3]
	TriggerClientEvent('qb-admin:client:GiveNuiFocus', playerid, focus, mouse)
end, 'admin')

DGCore.Commands.Add('warn', 'Warn A Player (Admin Only)', { { name = 'ID', help = 'Player' }, { name = 'Reason', help = 'Mention a reason' } }, true, function(source, args)
	local targetPlayer = DGCore.Functions.GetPlayer(tonumber(args[1]))
	local senderPlayer = DGCore.Functions.GetPlayer(source)
	table.remove(args, 1)
	local msg = table.concat(args, ' ')
	local myName = senderPlayer.PlayerData.name
	local warnId = 'WARN-' .. math.random(1111, 9999)
	if targetPlayer ~= nil then
		TriggerClientEvent('chat:addMessage', targetPlayer.PlayerData.source, {
			author = 'SYSTEM',
			message = 'You have been warned by: ' .. GetPlayerName(source) .. 'Reason: ' .. msg,
			color = 'error'
		})
		TriggerClientEvent('chat:addMessage', source, {
			author = 'SYSTEM',
			message = 'You have warned ' .. GetPlayerName(targetPlayer.PlayerData.source) .. ' for: ' .. msg,
			color = 'error'
		})
		exports.oxmysql:insert('INSERT INTO player_warns (senderIdentifier, targetIdentifier, reason, warnId) VALUES (?, ?, ?, ?)', {
			senderPlayer.PlayerData.license,
			targetPlayer.PlayerData.license,
			msg,
			warnId
		})
	else
		TriggerClientEvent('DGCore:Notify', source, 'This player is not online', 'error')
	end
end, 'admin')

DGCore.Commands.Add('checkwarns', 'Check Player Warnings (Admin Only)', { { name = 'ID', help = 'Player' }, { name = 'Warning', help = 'Number of warning, (1, 2 or 3 etc..)' } }, false, function(source, args)
	if args[2] == nil then
		local targetPlayer = DGCore.Functions.GetPlayer(tonumber(args[1]))
		local result = exports.oxmysql:executeSync('SELECT * FROM player_warns WHERE targetIdentifier = ?', { targetPlayer.PlayerData.license })
		TriggerClientEvent('chat:addMessage', source, {
			author = 'SYSTEM',
			message = targetPlayer.PlayerData.name .. ' has ' .. tablelength(result) .. ' warnings!',
			color = 'warning'
		})
	else
		local targetPlayer = DGCore.Functions.GetPlayer(tonumber(args[1]))
		local warnings = exports.oxmysql:executeSync('SELECT * FROM player_warns WHERE targetIdentifier = ?', { targetPlayer.PlayerData.license })
		local selectedWarning = tonumber(args[2])
		if warnings[selectedWarning] ~= nil then
			local sender = DGCore.Functions.GetPlayer(warnings[selectedWarning].senderIdentifier)
			TriggerClientEvent('chat:addMessage', source, {
				author = "SYSTEM",
				message = targetPlayer.PlayerData.name .. ' has been warned by ' .. sender.PlayerData.name .. 'Reason: ' .. warnings[selectedWarning].reason,
				color = 'warning',
			})
		end
	end
end, 'admin')

DGCore.Commands.Add('delwarn', 'Delete Players Warnings (Admin Only)', { { name = 'ID', help = 'Player' }, { name = 'Warning', help = 'Number of warning, (1, 2 or 3 etc..)' } }, true, function(source, args)
	local targetPlayer = DGCore.Functions.GetPlayer(tonumber(args[1]))
	local warnings = exports.oxmysql:executeSync('SELECT * FROM player_warns WHERE targetIdentifier = ?', { targetPlayer.PlayerData.license })
	local selectedWarning = tonumber(args[2])
	if warnings[selectedWarning] ~= nil then
		local sender = DGCore.Functions.GetPlayer(warnings[selectedWarning].senderIdentifier)
		TriggerClientEvent('chat:addMessage', source, {
			author = 'SYSTEM',
			message = 'You have deleted warning(' .. selectedWarning .. ')Reason: ' .. warnings[selectedWarning].reason,
			color = 'warning'
		})
		exports.oxmysql:execute('DELETE FROM player_warns WHERE warnId = ?', { warnings[selectedWarning].warnId })
	end
end, 'admin')

DGCore.Commands.Add('reportr', 'Reply To A Report (Admin Only)', {}, false, function(source, args)
	local playerId = tonumber(args[1])
	table.remove(args, 1)
	local msg = table.concat(args, ' ')
	local OtherPlayer = DGCore.Functions.GetPlayer(playerId)
	local Player = DGCore.Functions.GetPlayer(source)
	if OtherPlayer ~= nil then
		TriggerClientEvent('chat:addMessage', playerId, {
			author = 'ADMIN - ' .. GetPlayerName(source),
			message = msg,
			color = 'warning'
		})
		TriggerClientEvent('DGCore:Notify', source, 'Sent reply')
		for k, v in pairs(DGCore.Functions.GetPlayers()) do
			if DGCore.Functions.HasPermission(v, 'admin') or IsPlayerAceAllowed(src, 'command') then
				if DGCore.Functions.IsOptin(v) then
					TriggerClientEvent('chat:addMessage', v, {
						author = 'REPORT REPLY (' .. source .. ') - ' .. GetPlayerName(source),
						message = msg,
						color = 'warning'
					})
					TriggerEvent('qb-log:server:CreateLog', 'report', 'Report Reply', 'red', '**' .. GetPlayerName(source) .. '** replied on: **' .. OtherPlayer.PlayerData.name .. ' **(ID: ' .. OtherPlayer.PlayerData.source .. ') **Message:** ' .. msg, false)
				end
			end
		end
	else
		TriggerClientEvent('DGCore:Notify', source, 'Player is not online', 'error')
	end
end, 'admin')

DGCore.Commands.Add('setmodel', 'Change Ped Model (Admin Only)', { { name = 'model', help = 'Name of the model' }, { name = 'id', help = 'Id of the Player (empty for yourself)' } }, false, function(source, args)
	local model = args[1]
	local target = tonumber(args[2])
	if model ~= nil or model ~= '' then
		if target == nil then
			TriggerClientEvent('qb-admin:client:SetModel', source, tostring(model))
		else
			local Trgt = DGCore.Functions.GetPlayer(target)
			if Trgt ~= nil then
				TriggerClientEvent('qb-admin:client:SetModel', target, tostring(model))
			else
				TriggerClientEvent('DGCore:Notify', source, 'This person is not online..', 'error')
			end
		end
	else
		TriggerClientEvent('DGCore:Notify', source, 'You did not set a model..', 'error')
	end
end, 'admin')

DGCore.Commands.Add('setspeed', 'Set Player Foot Speed (Admin Only)', {}, false, function(source, args)
	local speed = args[1]
	if speed ~= nil then
		TriggerClientEvent('qb-admin:client:SetSpeed', source, tostring(speed))
	else
		TriggerClientEvent('DGCore:Notify', source, 'You did not set a speed.. (`fast` for super-run, `normal` for normal)', 'error')
	end
end, 'admin')

DGCore.Commands.Add('reporttoggle', 'Toggle Incoming Reports (Admin Only)', {}, false, function(source, args)
	DGCore.Functions.ToggleOptin(source)
	if DGCore.Functions.IsOptin(source) then
		TriggerClientEvent('DGCore:Notify', source, 'You are receiving reports', 'success')
	else
		TriggerClientEvent('DGCore:Notify', source, 'You are not receiving reports', 'error')
	end
end, 'admin')

RegisterCommand('kickall', function(source, args, rawCommand)
	local src = source
	if src > 0 then
		local reason = table.concat(args, ' ')
		local Player = DGCore.Functions.GetPlayer(src)

		if DGCore.Functions.HasPermission(src, 'god') or IsPlayerAceAllowed(src, 'command') then
			if args[1] ~= nil then
				for k, v in pairs(DGCore.Functions.GetPlayers()) do
					local Player = DGCore.Functions.GetPlayer(v)
					if Player ~= nil then
						DropPlayer(Player.PlayerData.source, reason)
					end
				end
			else
				TriggerClientEvent('chat:addMessage', src, {
					author = 'SYSTEM',
					message = 'Mention a reason..',
					color = 'error'
				})
			end
		else
			TriggerClientEvent('chat:addMessage', src, {
				author = 'SYSTEM',
				message = 'You can\'t do this..',
				color = 'error'
			})
		end
	else
		for k, v in pairs(DGCore.Functions.GetPlayers()) do
			local Player = DGCore.Functions.GetPlayer(v)
			if Player ~= nil then
				DropPlayer(Player.PlayerData.source, 'Server restart, check our Discord for more information: ' .. DGCore.Config.Server.discord)
			end
		end
	end
end, false)