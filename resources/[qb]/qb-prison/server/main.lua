local AlarmActivated = false

RegisterServerEvent('prison:server:SetJailStatus')
AddEventHandler('prison:server:SetJailStatus', function(jailTime)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    Player.Functions.SetMetaData("injail", jailTime)
    if jailTime > 0 then
        if Player.PlayerData.job.name ~= "unemployed" then
            Player.Functions.SetJob("unemployed")
            TriggerClientEvent('DGCore:Notify', src, "You're unemployed..")
        end
    end
end)

RegisterServerEvent('prison:server:SaveJailItems')
AddEventHandler('prison:server:SaveJailItems', function(jailTime)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local amount = 10
    if Player.PlayerData.metadata["jailitems"] == nil or next(Player.PlayerData.metadata["jailitems"]) == nil then 
        Player.Functions.SetMetaData("jailitems", Player.PlayerData.items)
        Citizen.Wait(2000)
    end
    exports['dg-chat']:addMessage(src, {
      prefix = 'SYSTEM: ',
      message = 'Je eigendommen zijn zijn in beslag genomen, deze kan je terugvinden aan de balie.',
      type = 'warning'
    })
end)

RegisterServerEvent('prison:server:GiveJailItems')
AddEventHandler('prison:server:GiveJailItems', function()
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    Citizen.Wait(1000)
    for k, v in pairs(Player.PlayerData.metadata["jailitems"]) do
        -- Player.Functions.AddItem(v.name, v.amount, false, v.info)
    end
    exports['dg-chat']:addMessage(src, {
      prefix = 'SYSTEM: ',
      message = 'Je hebt je inbeslaggenome eigendommen zijn teruggegeven.',
      type = 'warning'
    })
    Citizen.Wait(1000)
    Player.Functions.SetMetaData("jailitems", {})
    
end)

RegisterServerEvent('prison:server:SecurityLockdown')
AddEventHandler('prison:server:SecurityLockdown', function()
    local src = source
    TriggerClientEvent("prison:client:SetLockDown", -1, true)
    for k, v in pairs(DGCore.Functions.GetPlayers()) do
        local Player = DGCore.Functions.GetPlayer(v)
        if Player ~= nil then 
            if (Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty) then
                TriggerClientEvent("prison:client:PrisonBreakAlert", v)
            end
            if (Player.PlayerData.metadata.injail) then
                exports['dg-chat']:addMessage(v, {
                  prefix = 'SYSTEM: ',
                  message = 'De gevangenis is in lockdown, gelieve op de binnekoer te blijven.',
                  type = 'warning'
                })
            end
        end
	end
end)

RegisterServerEvent('prison:server:SetGateHit')
AddEventHandler('prison:server:SetGateHit', function(key)
    local src = source
    TriggerClientEvent("prison:client:SetGateHit", -1, key, true)
    if math.random(1, 100) <= 50 then
        for k, v in pairs(DGCore.Functions.GetPlayers()) do
            local Player = DGCore.Functions.GetPlayer(v)
            if Player ~= nil then 
                if (Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty) then
                    TriggerClientEvent("prison:client:PrisonBreakAlert", v)
                end
            end
        end
    end
end)

RegisterServerEvent('prison:server:CheckRecordStatus')
AddEventHandler('prison:server:CheckRecordStatus', function()
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local CriminalRecord = Player.PlayerData.metadata["criminalrecord"]
    local currentDate = os.date("*t")

    if (CriminalRecord["date"].month + 1) == 13 then
        CriminalRecord["date"].month = 0
    end

    if CriminalRecord["hasRecord"] then
        if currentDate.month == (CriminalRecord["date"].month + 1) or currentDate.day == (CriminalRecord["date"].day - 1) then
            CriminalRecord["hasRecord"] = false
            CriminalRecord["date"] = nil
        end
    end
end)

RegisterServerEvent('prison:server:JailAlarm')
AddEventHandler('prison:server:JailAlarm', function()
    if not AlarmActivated then
        TriggerClientEvent('prison:client:JailAlarm', -1, true)
        SetTimeout(5 * (60 * 1000), function()
            TriggerClientEvent('prison:client:JailAlarm', -1, false)
        end)
    end
end)

DGCore.Functions.CreateCallback('prison:server:IsAlarmActive', function(source, cb)
    cb(AlarmActivated)
end)