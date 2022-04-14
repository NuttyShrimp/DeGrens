local inWatch = false
local isLoggedIn = false

RegisterNetEvent("DGCore:Client:OnPlayerUnload")
AddEventHandler("DGCore:Client:OnPlayerUnload", function()
    isLoggedIn = false
end)

RegisterNetEvent("DGCore:Client:OnPlayerLoaded")
AddEventHandler("DGCore:Client:OnPlayerLoaded", function()
    isLoggedIn = true
end)

function openWatch()
    SendNUIMessage({
        action = "openWatch",
        watchData = {}
    })
    SetNuiFocus(true, true)
    inWatch = true
end

function closeWatch()
    SetNuiFocus(false, false)
end

RegisterNUICallback('close', function()
    closeWatch()
end)

RegisterNetEvent('qb-fitbit:use')
AddEventHandler('qb-fitbit:use', function()
  openWatch(true)
end)

RegisterNUICallback('setFoodWarning', function(data)
    local foodValue = tonumber(data.value)

    TriggerServerEvent('qb-fitbit:server:setValue', 'food', foodValue)

    DGCore.Functions.Notify('Fitbit: Hunger warning set to '..foodValue..'%')
end)

RegisterNUICallback('setThirstWarning', function(data)
    local thirstValue = tonumber(data.value)

    TriggerServerEvent('qb-fitbit:server:setValue', 'thirst', thirstValue)

    DGCore.Functions.Notify('Fitbit: Thirst warning set to '..thirstValue..'%')
end)

Citizen.CreateThread(function()
    while true do

        Citizen.Wait(5 * 60 * 1000)
        
        --TODO: Move garbage to server when hunger and thirst is updated
        if isLoggedIn then
            DGCore.Functions.TriggerCallback('qb-fitbit:server:HasFitbit', function(hasItem)
                if hasItem then
                    local PlayerData = DGCore.Functions.GetPlayerData()
                    if PlayerData.metadata["fitbit"].food ~= nil then
                        if PlayerData.metadata["hunger"] < PlayerData.metadata["fitbit"].food then
                            TriggerEvent('chat:addMessage', {
                              args: {'FITBIT', "Your hunger is "..round(PlayerData.metadata["hunger"], 2).."%"}
                            })
                            PlaySound(-1, "Event_Start_Text", "GTAO_FM_Events_Soundset", 0, 0, 1)
                        end
                    end
        
                    if PlayerData.metadata["fitbit"].thirst ~= nil then
                        if PlayerData.metadata["thirst"] < PlayerData.metadata["fitbit"].thirst  then
                            TriggerEvent('chat:addMessage', {
                              args: {'FITBIT', "Your thirst is "..round(PlayerData.metadata["thirst"], 2).."%"}
                            })
                            PlaySound(-1, "Event_Start_Text", "GTAO_FM_Events_Soundset", 0, 0, 1)
                        end
                    end
                end
            end, "fitbit")
        end
    end
end)

function round(num, numDecimalPlaces)
    local mult = 10^(numDecimalPlaces or 0)
    return math.floor(num * mult + 0.5) / mult
end
