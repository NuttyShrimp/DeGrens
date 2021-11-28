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
    local result = exports.oxmysql:executeSync('SELECT * FROM permissions', {})
    if result[1] then
        for k, v in pairs(result) do
            DGCore.Config.Server.PermissionList[v.license] = {
                license = v.license,
                permission = v.permission,
                optin = true,
            }
        end
    end
end)

