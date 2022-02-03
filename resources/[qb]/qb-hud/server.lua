local DGCore = exports['dg-core']:GetCoreObject()

local ResetStress = false

DGCore.Commands.Add('cash', 'Check Cash Balance', {}, false, function(source, args)
    local cashamount = exports['dg-financials']:getCash(source)
		TriggerClientEvent('hud:client:ShowAccounts', source, 'cash', cashamount)
end)

RegisterServerEvent('hud:server:GainStress')
AddEventHandler('hud:server:GainStress', function(amount)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local newStress
    if Player ~= nil and Player.PlayerData.job.name ~= 'police' then
        if not ResetStress then
            if Player.PlayerData.metadata['stress'] == nil then
                Player.PlayerData.metadata['stress'] = 0
            end
            newStress = Player.PlayerData.metadata['stress'] + amount
            if newStress <= 0 then newStress = 0 end
        else
            newStress = 0
        end
        if newStress > 100 then
            newStress = 100
        end
        Player.Functions.SetMetaData('stress', newStress)
        TriggerClientEvent('hud:client:UpdateStress', src, newStress)
        TriggerClientEvent('DGCore:Notify', src, 'Getting Stressed', 'error', 1500)
	end
end)

RegisterServerEvent('hud:server:RelieveStress')
AddEventHandler('hud:server:RelieveStress', function(amount)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local newStress
    if Player ~= nil then
        if not ResetStress then
            if Player.PlayerData.metadata['stress'] == nil then
                Player.PlayerData.metadata['stress'] = 0
            end
            newStress = Player.PlayerData.metadata['stress'] - amount
            if newStress <= 0 then newStress = 0 end
        else
            newStress = 0
        end
        if newStress > 100 then
            newStress = 100
        end
        Player.Functions.SetMetaData('stress', newStress)
        TriggerClientEvent('hud:client:UpdateStress', src, newStress)
        TriggerClientEvent('DGCore:Notify', src, 'You Are Relaxing')
	end
end)