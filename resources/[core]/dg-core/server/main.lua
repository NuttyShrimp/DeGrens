DGCore = {}
DGCore.Config = DGConfig
DGCore.Shared = DGShared
DGCore.ServerCallbacks = {}

exports('GetCoreObject', function()
    return DGCore
end)

-- To use this export in a script instead of manifest method
-- Just put this line of code below at the very top of the script
-- local DGCore = exports['dg-core']:GetCoreObject()

CreateThread(function()
	Wait(1000)
	if GetConvar('is_production', 'true') == 'true' then
		print('\x1b[33m====================================')
		print('\x1b[31m[DG-Core] Running in production mode')
		print('\x1b[33m====================================')
	end
end)

RegisterCommand('forceSave', function(src)
  DGCore.Players.Save(src)
end)