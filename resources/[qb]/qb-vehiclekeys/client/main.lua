local PlayerData = {}
local HasKey = false
local IsRobbing = false
local IsHotwiring = false
local isLoggedIn = false
local AlertSend = false
local lockpicked = false
local lockpickedPlate = nil

-- Events

RegisterNetEvent('DGCore:Client:OnPlayerLoaded')
AddEventHandler('DGCore:Client:OnPlayerLoaded', function()
    PlayerData = DGCore.Functions.GetPlayerData()
    isLoggedIn = true
end)

RegisterNetEvent('DGCore:Client:OnPlayerUnload')
AddEventHandler('DGCore:Client:OnPlayerUnload', function()
    isLoggedIn = false
    PlayerData = {}
end)

RegisterNetEvent('DGCore:Client:OnJobUpdate')
AddEventHandler('DGCore:Client:OnJobUpdate', function(JobInfo)
    PlayerData.job = JobInfo
end)

RegisterNetEvent('vehiclekeys:client:SetOwner')
AddEventHandler('vehiclekeys:client:SetOwner', function(plate)
    local VehPlate = plate
    local CurrentVehPlate = GetVehicleNumberPlateText(GetVehiclePedIsIn(PlayerPedId(), true))
    if VehPlate == nil then
        VehPlate = CurrentVehPlate
    end
    TriggerServerEvent('vehiclekeys:server:SetVehicleOwner', VehPlate)
    if IsPedInAnyVehicle(PlayerPedId()) and plate == CurrentVehPlate then
        SetVehicleEngineOn(GetVehiclePedIsIn(PlayerPedId(), true), true, false, true)
    end
    HasKey = true
end)

RegisterNetEvent('vehiclekeys:client:GiveKeys')
AddEventHandler('vehiclekeys:client:GiveKeys', function(target)
    local plate = GetVehicleNumberPlateText(GetVehiclePedIsIn(PlayerPedId(), true))
    TriggerServerEvent('vehiclekeys:server:GiveVehicleKeys', plate, target)
end)

RegisterNetEvent('vehiclekeys:client:ToggleEngine')
AddEventHandler('vehiclekeys:client:ToggleEngine', function()
    local EngineOn = IsVehicleEngineOn(GetVehiclePedIsIn(PlayerPedId()))
    local veh = GetVehiclePedIsIn(PlayerPedId(), true)
    if HasKey then
        if EngineOn then
            SetVehicleEngineOn(veh, false, false, true)
        else
            SetVehicleEngineOn(veh, true, false, true)
        end
    end
end)

-- This event is to prevent you from having to /logout after restarting the vehiclekeys, will only trigger when the resource gets restarted manually or by the server, not client-side, client-side has it's own event: onClientResourceStart

AddEventHandler('onResourceStart', function(resource)
    if resource == GetCurrentResourceName() then
        Wait(100)
        PlayerData = DGCore.Functions.GetPlayerData()
        isLoggedIn = true
    end
end)

-- Main Thread
CreateThread(function()
    while true do
        local sleep = 100
        if isLoggedIn then
            local ped = PlayerPedId()
            local entering = GetVehiclePedIsTryingToEnter(ped)
            if entering ~= 0 then
                sleep = 2000
                local plate = GetVehicleNumberPlateText(entering)
                DGCore.Functions.TriggerCallback('vehiclekeys:CheckOwnership', function(result)
                    if not result then -- if not player owned
                        local driver = GetPedInVehicleSeat(entering, -1)
                        if driver ~= 0 and not IsPedAPlayer(driver) then
                            if Config.Rob then
                                if IsEntityDead(driver) then
                                    TriggerEvent("vehiclekeys:client:SetOwner", plate)
                                    SetVehicleDoorsLocked(entering, 1)
                                    HasKey = true
                                else
                                    SetVehicleDoorsLocked(entering, 2)
                                end
                            else
                                TriggerEvent("vehiclekeys:client:SetOwner", plate)
                                SetVehicleDoorsLocked(entering, 1)
                                HasKey = true
                            end
                        else
                            if not lockpicked and lockpickedPlate ~= plate then
                                DGCore.Functions.TriggerCallback('vehiclekeys:CheckHasKey', function(result)
                                    if result == false then
                                        SetVehicleDoorsLocked(entering, 2)
                                    else
                                        HasKey = true
                                    end
                                end, plate)
                            end
                        end
                    end
                end, plate)
            end

            if IsPedInAnyVehicle(ped, false) and lockpicked and not IsHotwiring and not HasKey then
                sleep = 7
                local veh = GetVehiclePedIsIn(ped)
                local vehpos = GetOffsetFromEntityInWorldCoords(veh, 0.0, 2.0, 1.0)
                SetVehicleEngineOn(veh, false, false, true)
                if GetPedInVehicleSeat(veh, -1) == PlayerPedId() then
                    DrawText3D(vehpos.x, vehpos.y, vehpos.z, "~g~H~w~ - Hotwire")
                    if IsControlJustPressed(0, 74) then
                        Hotwire()
                    end
                end
            end

            if Config.Rob then
                if not IsRobbing then
                    local playerid = PlayerId()
                    local aiming, target = GetEntityPlayerIsFreeAimingAt(playerid)
                    if aiming and (target ~= nil and target ~= 0) then
                        if DoesEntityExist(target) and not IsEntityDead(target) and not IsPedAPlayer(target) then
                            if IsPedInAnyVehicle(target, false) then
                                local targetveh = GetVehiclePedIsIn(target)
                                if GetPedInVehicleSeat(targetveh, -1) == target then
                                    if not IsBlacklistedWeapon() then
                                        local pos = GetEntityCoords(ped, true)
                                        local targetpos = GetEntityCoords(target, true)
                                        if #(pos - targetpos) < 5.0 then
                                            RobVehicle(target)
                                        end
                                    end
                                end
                            end
                        end
                    end
                end
            end
        end
        Wait(sleep)
    end
end)

-- Vehicle Locking

RegisterKeyMapping('togglelocks', 'Toggle Vehicle Locks', 'keyboard', 'L')
RegisterCommand('togglelocks', function()
    LockVehicle()
end)

function LockVehicle()
    local ped = PlayerPedId()
    local pos = GetEntityCoords(ped)
    local veh = DGCore.Functions.GetClosestVehicle(pos)
    local plate = GetVehicleNumberPlateText(veh)
    local vehpos = GetEntityCoords(veh)
    if IsPedInAnyVehicle(ped) then
        veh = GetVehiclePedIsIn(ped)
    end
    if veh ~= nil and #(pos - vehpos) < 7.5 then
        DGCore.Functions.TriggerCallback('vehiclekeys:CheckHasKey', function(result)
            if result then
                local vehLockStatus = GetVehicleDoorLockStatus(veh)
                loadAnimDict("anim@mp_player_intmenu@key_fob@")
                TaskPlayAnim(ped, 'anim@mp_player_intmenu@key_fob@', 'fob_click', 3.0, 3.0, -1, 49, 0, false, false,
                    false)

                if vehLockStatus == 1 then
                    Citizen.Wait(750)
                    ClearPedTasks(ped)
                    TriggerServerEvent("InteractSound_SV:PlayWithinDistance", 5, "lock", 0.3)
                    SetVehicleDoorsLocked(veh, 2)
                    if (GetVehicleDoorLockStatus(veh) == 2) then
                        SetVehicleLights(veh, 2)
                        Wait(250)
                        SetVehicleLights(veh, 1)
                        Wait(200)
                        SetVehicleLights(veh, 0)
                        DGCore.Functions.Notify("Vehicle locked!")
                    else
                        DGCore.Functions.Notify("Something went wrong with the locking system!")
                    end
                else
                    Citizen.Wait(750)
                    ClearPedTasks(ped)
                    TriggerServerEvent("InteractSound_SV:PlayWithinDistance", 5, "unlock", 0.3)
                    SetVehicleDoorsLocked(veh, 1)
                    if (GetVehicleDoorLockStatus(veh) == 1) then
                        SetVehicleLights(veh, 2)
                        Wait(250)
                        SetVehicleLights(veh, 1)
                        Wait(200)
                        SetVehicleLights(veh, 0)
                        DGCore.Functions.Notify("Vehicle unlocked!")
                    else
                        DGCore.Functions.Notify("Something went wrong with the locking system!")
                    end
                end
            else
                DGCore.Functions.Notify('You don\'t have the keys of the vehicle..', 'error')
            end
        end, plate)
    end
end

-- Lockpicking

RegisterNetEvent('lockpick:UseLockpick', function()
    LockpickDoor()
end)

function LockpickDoor()
    local ped = PlayerPedId()
    local pos = GetEntityCoords(ped)
    local vehicle = DGCore.Functions.GetClosestVehicle(pos)
    if vehicle ~= nil and vehicle ~= 0 then
        local vehpos = GetEntityCoords(vehicle)
        if #(pos - vehpos) < 2.5 then
            local vehLockStatus = GetVehicleDoorLockStatus(vehicle)
            if (vehLockStatus > 0) then
                TriggerEvent('qb-lockpick:client:openLockpick', lockpickFinish)
            end
        end
    end
end

function lockpickFinish(success)
    local ped = PlayerPedId()
    local pos = GetEntityCoords(ped)
    local vehicle = DGCore.Functions.GetClosestVehicle(pos)
    local chance = math.random()
    if success then
        TriggerServerEvent('hud:server:GainStress', math.random(1, 4))
        DGCore.Functions.Notify('Opened Door!', 'success')
        SetVehicleDoorsLocked(vehicle, 1)
        lockpicked = true
        lockpickedPlate = GetVehicleNumberPlateText(vehicle)
    else
        PoliceCall()
        TriggerServerEvent('hud:server:GainStress', math.random(1, 4))
        DGCore.Functions.Notify('Someone Called The Police!', 'error')
    end
    if chance <= Config.RemoveLockpickNormal then
        TriggerServerEvent("DGCore:Server:RemoveItem", "lockpick", 1)
    end
end

-- Hotwire Vehicle

function Hotwire()
    if not HasKey then
        local ped = PlayerPedId()
        local vehicle = GetVehiclePedIsIn(ped, true)
        IsHotwiring = true
        lockpickedPlate = nil
        local hotwireTime = math.random(20000, 40000)
        SetVehicleAlarm(vehicle, true)
        SetVehicleAlarmTimeLeft(vehicle, hotwireTime)
        PoliceCall()
        DGCore.Functions.Progressbar("hotwire_vehicle", "Engaging the ignition switch", hotwireTime, false, true, {
            disableMovement = true,
            disableCarMovement = true,
            disableMouse = false,
            disableCombat = true
        }, {
            animDict = "anim@amb@clubhouse@tutorial@bkr_tut_ig3@",
            anim = "machinic_loop_mechandplayer",
            flags = 16
        }, {}, {}, function() -- Done
            StopAnimTask(ped, "anim@amb@clubhouse@tutorial@bkr_tut_ig3@", "machinic_loop_mechandplayer", 1.0)
            if (math.random() <= Config.HotwireChance) then
                lockpicked = false
                TriggerServerEvent('hud:server:GainStress', math.random(1, 4))
                TriggerEvent('vehiclekeys:client:SetOwner', GetVehicleNumberPlateText(vehicle))
                DGCore.Functions.Notify("Hotwire succeeded!")
            else
                SetVehicleEngineOn(veh, false, false, true)
                TriggerServerEvent('hud:server:GainStress', math.random(1, 4))
                DGCore.Functions.Notify("Hotwire failed!", "error")
            end
            IsHotwiring = false
        end, function() -- Cancel
            StopAnimTask(ped, "anim@amb@clubhouse@tutorial@bkr_tut_ig3@", "machinic_loop_mechandplayer", 1.0)
            SetVehicleEngineOn(veh, false, false, true)
            DGCore.Functions.Notify("Hotwire failed!", "error")
            IsHotwiring = false
        end)
    end
end

-- Alert Police

function PoliceCall()
    if not AlertSend then
        local ped = PlayerPedId()
        local pos = GetEntityCoords(ped)
        local chance = Config.PoliceAlertChance
        if GetClockHours() >= 1 and GetClockHours() <= 6 then
            chance = Config.PoliceNightAlertChance
        end
        if math.random() <= chance then
            local closestPed = GetNearbyPed()
            if closestPed ~= nil then
                local msg = ""
                local s1, s2 = Citizen.InvokeNative(0x2EB41072B4C1E4C0, pos.x, pos.y, pos.z, Citizen.PointerValueInt(),
                    Citizen.PointerValueInt())
                local streetLabel = GetStreetNameFromHashKey(s1)
                local street2 = GetStreetNameFromHashKey(s2)
                if street2 ~= nil and street2 ~= "" then
                    streetLabel = streetLabel .. " " .. street2
                end
                local alertTitle = ""
                if IsPedInAnyVehicle(ped) then
                    local vehicle = GetVehiclePedIsIn(ped, false)
                    local modelName = GetDisplayNameFromVehicleModel(GetEntityModel(vehicle)):lower()
                    if DGCore.Shared.Vehicles[modelName] ~= nil then
                        Name = DGCore.Shared.Vehicles[modelName]["brand"] .. ' ' .. DGCore.Shared.Vehicles[modelName]["name"]
                    else
                        Name = "Unknown"
                    end
                    local modelPlate = GetVehicleNumberPlateText(vehicle)
                    local msg = "Vehicle theft attempt at " .. streetLabel .. ". Vehicle: " .. Name .. ", Licenseplate: " .. modelPlate
                    local alertTitle = "Vehicle theft attempt at"
                    TriggerServerEvent("police:server:VehicleCall", pos, msg, alertTitle, streetLabel, modelPlate, Name)
                else
                    local vehicle = DGCore.Functions.GetClosestVehicle()
                    local modelName = GetDisplayNameFromVehicleModel(GetEntityModel(vehicle)):lower()
                    local modelPlate = GetVehicleNumberPlateText(vehicle)
                    if DGCore.Shared.Vehicles[modelName] ~= nil then
                        Name = DGCore.Shared.Vehicles[modelName]["brand"] .. ' ' .. DGCore.Shared.Vehicles[modelName]["name"]
                    else
                        Name = "Unknown"
                    end
                    local msg = "Vehicle theft attempt at " .. streetLabel .. ". Vehicle: " .. Name .. ", Licenseplate: " .. modelPlate
                    local alertTitle = "Vehicle theft attempt at"
                    TriggerServerEvent("police:server:VehicleCall", pos, msg, alertTitle, streetLabel, modelPlate, Name)
                end
            end
        end
        AlertSend = true
        SetTimeout(Config.AlertCooldown, function()
            AlertSend = false
        end)
    end
end

-- Rob a vehicle

function RobVehicle(target)
    IsRobbing = true
    loadAnimDict('mp_am_hold_up')
    TaskPlayAnim(target, "mp_am_hold_up", "holdup_victim_20s", 8.0, -8.0, -1, 2, 0, false, false, false)
    DGCore.Functions.Progressbar("rob_keys", "Attempting Robbery..", 6000, false, true, {}, {}, {}, {}, function()
        local chance = math.random()
        if chance <= Config.RobberyChance then
            veh = GetVehiclePedIsUsing(target)
            TaskEveryoneLeaveVehicle(veh)
            Wait(500)
            ClearPedTasksImmediately(target)
            TaskReactAndFleePed(target, PlayerPedId())
            local plate = GetVehicleNumberPlateText(GetVehiclePedIsIn(target, true))
            TriggerServerEvent('hud:server:GainStress', math.random(1, 4))
            TriggerEvent('vehiclekeys:client:SetOwner', plate)
            DGCore.Functions.Notify('You Got The Keys!', 'success')
            Wait(10000)
            IsRobbing = false
        else
            PoliceCall()
            ClearPedTasks(target)
            TaskReactAndFleePed(target, PlayerPedId())
            TriggerServerEvent('hud:server:GainStress', math.random(1, 4))
            DGCore.Functions.Notify('They Called The Cops!', 'error')
            Wait(10000)
            IsRobbing = false
        end
    end)
end

-- Util Functions

function loadAnimDict(dict)
    while (not HasAnimDictLoaded(dict)) do
        RequestAnimDict(dict)
        Citizen.Wait(0)
    end
end

function IsBlacklistedWeapon()
    local weapon = GetSelectedPedWeapon(PlayerPedId())
    if weapon ~= nil then
        for _, v in pairs(Config.NoRobWeapons) do
            if weapon == GetHashKey(v) then
                return true
            end
        end
    end
    return false
end

function GetNearbyPed()
    local retval = nil
    local PlayerPeds = {}
    for _, player in ipairs(GetActivePlayers()) do
        local ped = GetPlayerPed(player)
        table.insert(PlayerPeds, ped)
    end
    local player = PlayerPedId()
    local coords = GetEntityCoords(player)
    local closestPed, closestDistance = DGCore.Functions.GetClosestPed(coords, PlayerPeds)
    if not IsEntityDead(closestPed) and closestDistance < 30.0 then
        retval = closestPed
    end
    return retval
end

function DrawText3D(x, y, z, text)
    SetTextScale(0.35, 0.35)
    SetTextFont(4)
    SetTextProportional(1)
    SetTextColour(255, 255, 255, 215)
    SetTextEntry("STRING")
    SetTextCentre(true)
    AddTextComponentString(text)
    SetDrawOrigin(x, y, z, 0)
    DrawText(0.0, 0.0)
    local factor = (string.len(text)) / 370
    DrawRect(0.0, 0.0 + 0.0125, 0.017 + factor, 0.03, 0, 0, 0, 75)
    ClearDrawOrigin()
end
