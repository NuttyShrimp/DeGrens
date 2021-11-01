local DGCore = exports['dg-core']:GetCoreObject()

RegisterServerEvent('KickForAFK', function()
    local src = source
	DropPlayer(src, 'You Have Been Kicked For Being AFK')
end)

DGCore.Functions.CreateCallback('qb-afkkick:server:GetPermissions', function(source, cb)
    local src = source
    local group = DGCore.Functions.GetPermission(src)
    cb(group)
end)