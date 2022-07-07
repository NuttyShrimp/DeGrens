DGCore.Commands = {}
DGCore.Commands.List = {}

-- Register & Refresh Commands
local canImport = false
local awaitingCmds = {}

RegisterNetEvent("chat:startedChat", function(channel)
  canImport = true
  for _,cmd in pairs(awaitingCmds) do
    DGCore.Commands.Add(cmd.name, cmd.help, cmd.arguments, cmd.argsrequired, cmd.callback, cmd.permission)
  end
end)

function DGCore.Commands.Add(name, help, arguments, argsrequired, callback, permission)
	-- TODO: remove this deprecated function
	if type(permission) == 'string' then
		permission = permission:lower()
	else
		permission = 'user'
	end
	for k,v in pairs(arguments) do
	  v.description = v.help
	  v.help = nil
	  v.required = argsrequired
	end
	if canImport then
	  print(("[DGCore] DGCore.Commands.Add is deprecated | name: %s"):format(name))
    exports['dg-chat']:registerCommand(name, help, arguments, permission, function(src, cmd, args)
      callback(src, args)
    end)
   else
      awaitingCmds[#awaitingCmds+1] = {name = name, help = help, arguments = arguments, argsrequired = argsrequired, callback = callback, permission = permission}
   end
end

-- Teleport
DGCore.Commands.Add('tp', 'TP To Player or Coords (Admin Only)', { { name = 'id/x', help = 'ID of player or X position' }, { name = 'y', help = 'Y position' }, { name = 'z', help = 'Z position' } }, false, function(source, args)
	local src = source
	if args[1] and not args[2] and not args[3] then
		local target = GetPlayerPed(tonumber(args[1]))
		if target ~= 0 then
			local coords = GetEntityCoords(target)
			TriggerClientEvent('DGCore:Command:TeleportToPlayer', src, coords)
		else
			TriggerClientEvent('DGCore:Notify', src, 'Player Not Online', 'error')
		end
	else
		if args[1] and args[2] and args[3] then
			local x = tonumber(args[1])
			local y = tonumber(args[2])
			local z = tonumber(args[3])
			if (x ~= 0) and (y ~= 0) and (z ~= 0) then
				TriggerClientEvent('DGCore:Command:TeleportToCoords', src, x, y, z)
			else
				TriggerClientEvent('DGCore:Notify', src, 'Incorrect Format', 'error')
			end
		else
			TriggerClientEvent('DGCore:Notify', src, 'Not every argument has been entered (x, y, z)', 'error')
		end
	end
end, 'admin')

DGCore.Commands.Add('tpm', 'TP To Marker (Admin Only)', {}, false, function(source)
	local src = source
	TriggerClientEvent('DGCore:Command:GoToMarker', src)
end, 'admin')

-- Permissions

DGCore.Commands.Add('addpermission', 'Give Player Permissions (God Only)', { { name = 'id', help = 'ID of player' }, { name = 'permission', help = 'Permission level' } }, true, function(source, args)
	local src = source
	local Player = DGCore.Functions.GetPlayer(tonumber(args[1]))
	local permission = tostring(args[2]):lower()
	if Player then
		DGCore.Functions.AddPermission(Player.PlayerData.source, permission)
	else
		TriggerClientEvent('DGCore:Notify', src, 'Player Not Online', 'error')
	end
end, 'god')

DGCore.Commands.Add('removepermission', 'Remove Players Permissions (God Only)', { { name = 'id', help = 'ID of player' } }, true, function(source, args)
	local src = source
	local Player = DGCore.Functions.GetPlayer(tonumber(args[1]))
	if Player then
		DGCore.Functions.RemovePermission(Player.PlayerData.source)
	else
		TriggerClientEvent('DGCore:Notify', src, 'Player Not Online', 'error')
	end
end, 'god')

-- Vehicle

DGCore.Commands.Add('car', 'Spawn Vehicle (Admin Only)', { { name = 'model', help = 'Model name of the vehicle' } }, true, function(source, args)
	local src = source
	TriggerClientEvent('DGCore:Command:SpawnVehicle', src, args[1])
end, 'admin')

DGCore.Commands.Add('dv', 'Delete Vehicle (Admin Only)', {}, false, function(source)
	local src = source
	TriggerClientEvent('DGCore:Command:DeleteVehicle', src)
end, 'admin')

-- Gang

DGCore.Commands.Add('gang', 'Check Your Gang', {}, false, function(source)
	local src = source
	local PlayerGang = DGCore.Functions.GetPlayer(source).PlayerData.gang
	TriggerClientEvent('DGCore:Notify', src, string.format('[Gang]: %s [Grade]: %s', PlayerGang.label, PlayerGang.grade.name))
end, 'user')

DGCore.Commands.Add('setgang', 'Set A Players Gang (Admin Only)', { { name = 'id', help = 'Player ID' }, { name = 'gang', help = 'Name of a gang' }, { name = 'grade', help = 'Grade' } }, true, function(source, args)
	local src = source
	local Player = DGCore.Functions.GetPlayer(tonumber(args[1]))
	if Player then
		Player.Functions.SetGang(tostring(args[2]), tonumber(args[3]))
	else
		TriggerClientEvent('DGCore:Notify', src, 'Player Not Online', 'error')
	end
end, 'admin')

-- Inventory (should be in qb-inventory?)

DGCore.Commands.Add('clearinv', 'Clear Players Inventory (Admin Only)', { { name = 'id', help = 'Player ID' } }, false, function(source, args)
	local src = source
	local playerId = args[1] or src
	local Player = DGCore.Functions.GetPlayer(tonumber(playerId))
	if Player then
		Player.Functions.ClearInventory()
	else
		TriggerClientEvent('DGCore:Notify', src, 'Player Not Online', 'error')
	end
end, 'admin')
