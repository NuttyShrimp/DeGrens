openedSafes = {}
local safeState = false

function EnteredSafeZone()
    exports['dg-peek']:AddCircleZone("current_safe", Config.Stores[currentStore].safe, 0.4, {
        name = "current_safe",
        debugPoly = true,
    }, {
        options = {
            {
                type = "client",
                event = "dg-storerobbery:client:HackSafe",
                icon = "fas fa-hdd",
                label = "Hack",
                canInteract = function()
                    return exports['dg-storerobbery']:CanRobSafe()
                end,
            },
            {
                type = "client",
                event = "dg-storerobbery:client:LootSafe",
                icon = "fas fa-hand-holding-usd",
                label = "Neem",
                canInteract = function()
                    return exports['dg-storerobbery']:IsSafeOpen()
                end,
            }
        },
        distance = 1.2,
    })
end

function LeftSafeZone()
    exports['dg-peek']:RemoveZone("current_safe")
end

AddEventHandler("dg-storerobbery:client:HackSafe", function()
    if currentStore then
        DGCore.Functions.TriggerCallback('DGCore:HasItem', function(hasItem)
            CallCops(currentStore)

            if hasItem then
                exports["dg-numbergame"]:OpenGame(function(success)
                    TriggerServerEvent("DGCore:Server:RemoveItem", 'trojan_usb', 1)
                    TriggerEvent('inventory:client:ItemBox', exports["dg-inventory"]:GetItemData()["trojan_usb"], "remove")

                    GainStress()
                    CreateEvidence()

                    if success then
                        TriggerServerEvent("dg-storerobbery:server:HackSafe", currentStore)
                        TriggerServerEvent('qb-phone:server:sendNewMail', {
                            sender = "Hackerman",
                            subject = "Decodering Kluis",
                            message = "Het decoderen van de kluis zal even duren... <br><br> Geef me 5 minuten.",
                            button = {}
                        })

                        Citizen.SetTimeout(Config.Safe.LootDelay, function()
                            safeState = true
                        end)
                    else
                        DGCore.Functions.Notify('Mislukt...', 'error')
                    end
                end, Config.Safe.HackGridSize, Config.Safe.HackTime)
            else
                DGCore.Functions.Notify("Hoe ga je dit openen?", "error")
            end
        end, 'trojan_usb')
    end
end)

AddEventHandler("dg-storerobbery:client:LootSafe", function()
    if currentStore then
        safeState = false
        TriggerServerEvent("dg-storerobbery:server:LootSafe")
    end
end)

RegisterNetEvent("dg-storerobbery:client:UpdateOpenedSafe", function(safes)
    openedSafes = safes
end)

-- export for peek
exports('CanRobSafe', function()
    local retval = true

    if currentCops >= Config.RequiredCops then
        for _, v in pairs(openedSafes) do
            if currentStore == v then
                retval = false
                break
            end
        end
    else
        retval = false
    end
    
    return retval
end)

-- export for peek to check if you can loot
exports('IsSafeOpen', function()
    return safeState
end)