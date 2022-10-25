DGCore.Commands = {}

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
