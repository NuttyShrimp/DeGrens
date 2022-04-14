DGCore = {}
DGCore.Config = QBConfig
DGCore.Shared = DGShared
DGCore.ServerCallbacks = {}
DGCore.UseableItems = {}

exports('GetCoreObject', function()
    return DGCore
end)

-- To use this export in a script instead of manifest method
-- Just put this line of code below at the very top of the script
-- local DGCore = exports['dg-core']:GetCoreObject()

-- Get permissions on server start

CreateThread(function()
	local result = exports['dg-sql']:query('SELECT * FROM permissions', {})
	if result[1] then
		for k, v in pairs(result) do
			DGCore.Config.Server.PermissionList[v.steamid] = {
				steamid = v.steamid,
				permission = v.permission,
				optin = true,
			}
		end
	end
	Wait(1000)
	if GetConvar('is_production', 'true') == 'true' then
		print('\x1b[33m====================================')
		print('\x1b[31m[DG-Core] Running in production mode')
		print('\x1b[33m====================================')
	end
end)

RegisterCommand('forceSave', function(src,args, raw)
	local player = DGCore.Functions.GetPlayer(src)
	player.Functions.Save()
end)