DGCore = {}
DGCore.PlayerData = {}
DGCore.Config = QBConfig
DGCore.Shared = DGShared
DGCore.ServerCallbacks = {}

exports('GetCoreObject', function()
    return DGCore
end)

-- To use this export in a script instead of manifest method
-- Just put this line of code below at the very top of the script
-- local DGCore = exports['dg-core']:GetCoreObject()