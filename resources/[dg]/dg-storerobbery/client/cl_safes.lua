local lastStore = nil

function EnteredSafeZone()
    exports['dg-peek']:AddCircleZone("current_safe", Config.Stores[currentStore].safe.coords, 0.5, {
        name = "current_safe",
    }, {
        options = {
            {
                type = "client",
                event = "dg-storerobbery:client:HackSafe",
                icon = "fas fa-hdd",
                label = "Hack",
                canInteract = function()
                    return exports['dg-storerobbery']:CanHackSafe()
                end,
            },
            {
                type = "client",
                event = "dg-storerobbery:client:LootSafe",
                icon = "fas fa-hand-holding-usd",
                label = "Neem",
                canInteract = function()
                    return exports['dg-storerobbery']:CanLootSafe()
                end,
            }
        },
        distance = 1.2,
    })
    lastStore = currentStore
end

function LeftSafeZone()
    exports['dg-peek']:RemoveZone("current_safe")

    if Config.Stores[lastStore].safe.state == "decoding" then
        TriggerServerEvent("dg-storerobbery:server:LeftSafe", lastStore)
        DGCore.Functions.Notify("Verbinding verbroken", "error")
    end
end

local function CanHackSafe()
    return Config.Stores[currentStore].safe.state == "closed" 
end

local function CanLootSafe()
    return Config.Stores[currentStore].safe.state == "opened" 
end

AddEventHandler("dg-storerobbery:client:HackSafe", function()
    if currentStore then
        if CanHackSafe() then
            DGCore.Functions.TriggerCallback('DGCore:HasItem', function(hasItem)
                CallCops(currentStore)
    
                if hasItem then
                    exports["dg-numbergame"]:OpenGame(function(success)
                        TriggerServerEvent("DGCore:Server:RemoveItem", Config.Safe.Item, 1)
                        TriggerEvent('inventory:client:ItemBox', Config.Safe.Item, "remove")
    
                        GainStress()
                        CreateEvidence()
    
                        if success then
                            TriggerServerEvent("dg-storerobbery:server:HackSafe", currentStore)
    
                            Citizen.Wait(1000)
                            TriggerServerEvent('qb-phone:server:sendNewMail', {
                                sender = "Hackerman",
                                subject = "Decodering Kluis",
                                message = "Het decoderen van de kluis zal even duren... <br><br> Geef me "..(math.floor(Config.Safe.LootDelay / (60 * 1000))).." minuten. <br><br> Ga niet te ver of de verbinding zal verbreken!",
                            })
                        else
                            DGCore.Functions.Notify('Mislukt...', 'error')
                        end
                    end, Config.Hack.GridSize, Config.Hack.Time)
                else
                    DGCore.Functions.Notify("Hoe ga je dit openen?", "error")
                end
            end, Config.Safe.Item)
        end
    end
end)

AddEventHandler("dg-storerobbery:client:LootSafe", function()
    if currentStore then
        if CanLootSafe() then
            TriggerServerEvent("dg-storerobbery:server:LootSafe", currentStore)

            local ped = PlayerPedId()
            LoadAnimDict('amb@prop_human_bum_bin@idle_b')
            TaskPlayAnim(ped, "amb@prop_human_bum_bin@idle_b", "idle_d", 8.0, 8.0, -1, 50, 0, false, false, false)
            Citizen.Wait(700)
            TaskPlayAnim(ped, "amb@prop_human_bum_bin@idle_b", "exit", 8.0, 8.0, -1, 50, 0, false, false, false)
        end
    end
end)

RegisterNetEvent("dg-storerobbery:client:UpdateSafe", function(store, state)
    Config.Stores[store].safe.state = state
end)

-- exports for peek
exports('CanHackSafe', CanHackSafe)
exports('CanLootSafe', CanLootSafe)