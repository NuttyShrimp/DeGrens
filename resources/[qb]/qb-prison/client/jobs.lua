local currentLocation = 0 
currentBlip = nil
local isWorking = false

Citizen.CreateThread(function()
    while true do 
        Citizen.Wait(1)
        if inJail and currentJob ~= nil then 
            if currentLocation ~= 0 then
                if not DoesBlipExist(currentBlip) then
                    CreateJobBlip()
                end
                local pos = GetEntityCoords(PlayerPedId())
                if #(pos - vector3(Config.Locations.jobs[currentJob][currentLocation].coords.x, Config.Locations.jobs[currentJob][currentLocation].coords.y, Config.Locations.jobs[currentJob][currentLocation].coords.z)) < 10.0 and not isWorking then
                    DrawMarker(2, Config.Locations.jobs[currentJob][currentLocation].coords.x, Config.Locations.jobs[currentJob][currentLocation].coords.y, Config.Locations.jobs[currentJob][currentLocation].coords.z, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.3, 0.2, 0.15, 150, 200, 50, 222, false, false, false, true, false, false, false)
                    if #(pos - vector3(Config.Locations.jobs[currentJob][currentLocation].coords.x, Config.Locations.jobs[currentJob][currentLocation].coords.y, Config.Locations.jobs[currentJob][currentLocation].coords.z)) < 1 and not isWorking then
                        isWorking = true
                        DGCore.Functions.Progressbar("work_electric", "Working on electricity..", math.random(5000, 10000), false, true, {
                            disableMovement = true,
                            disableCarMovement = true,
                            disableMouse = false,
                            disableCombat = true,
                        }, {
                            animDict = "anim@gangops@facility@servers@",
                            anim = "hotwire",
                            flags = 16,
                        }, {}, {}, function() -- Done
                            isWorking = false
                            StopAnimTask(PlayerPedId(), "anim@gangops@facility@servers@", "hotwire", 1.0)
                            JobDone()
                        end, function() -- Cancel
                            isWorking = false
                            StopAnimTask(PlayerPedId(), "anim@gangops@facility@servers@", "hotwire", 1.0)
                            DGCore.Functions.Notify("Cancelled..", "error")
                        end)
                    end
                end
            else
                currentLocation = math.random(1, #Config.Locations.jobs[currentJob])
                CreateJobBlip()
            end
        else
            Citizen.Wait(5000)
        end
    end
end)

function JobDone()
    if math.random(1, 100) <= 50 then
        DGCore.Functions.Notify("You've worked some time off your sentence")
        jailTime = jailTime - math.random(1, 2)
    end
    local newLocation = math.random(1, #Config.Locations.jobs[currentJob])
    while (newLocation == currentLocation) do
        Citizen.Wait(100)
        newLocation = math.random(1, #Config.Locations.jobs[currentJob])
    end
    currentLocation = newLocation
    CreateJobBlip()
end

function CreateJobBlip()
    if currentLocation ~= 0 then
        if DoesBlipExist(currentBlip) then
            RemoveBlip(currentBlip)
        end
        currentBlip = AddBlipForCoord(Config.Locations.jobs[currentJob][currentLocation].coords.x, Config.Locations.jobs[currentJob][currentLocation].coords.y, Config.Locations.jobs[currentJob][currentLocation].coords.z)

        SetBlipSprite (currentBlip, 402)
        SetBlipDisplay(currentBlip, 4)
        SetBlipScale  (currentBlip, 0.8)
        SetBlipAsShortRange(currentBlip, true)
        SetBlipColour(currentBlip, 1)
    
        BeginTextCommandSetBlipName("STRING")
        AddTextComponentSubstringPlayerName(Config.Jobs[currentJob])
        EndTextCommandSetBlipName(currentBlip)

        local Chance = math.random(100)
        local Odd = math.random(100)
        if Chance == Odd then
            TriggerServerEvent('DGCore:Server:AddItem', 'phone', 1)
            TriggerEvent('inventory:client:ItemBox', exports["dg-inventory"]:GetItemData()["phone"], "add")
            DGCore.Functions.Notify("You found a phone..", "success")
        end
    end
end
