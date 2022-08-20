local NitrousActivated = false
local NitrousBoost = 35.0
local ScreenEffect = false
local NosFlames = nil
local VehicleNitrous = {}
local Fxs = {}

RegisterNetEvent('DGCore:Client:OnPlayerLoaded')
AddEventHandler('DGCore:Client:OnPlayerLoaded', function()
    DGCore.Functions.TriggerCallback('nitrous:GetNosLoadedVehs', function(vehs)
        VehicleNitrous = vehs
    end)
end)

RegisterNetEvent('smallresource:client:LoadNitrous')
AddEventHandler('smallresource:client:LoadNitrous', function()
    local IsInVehicle = IsPedInAnyVehicle(PlayerPedId())
    --local veh = GetVehiclePedIsIn(PlayerPedId())
    local ped = PlayerPedId()
    local veh = GetVehiclePedIsIn(ped)

    if not NitrousActivated then
        if IsInVehicle and not IsThisModelABike(GetEntityModel(GetVehiclePedIsIn(ped))) then
            if GetPedInVehicleSeat(veh, -1) == ped then
                DGCore.Functions.Progressbar("use_nos", "Connecting NOS...", 1000, false, true, {
                    disableMovement = false,
                    disableCarMovement = false,
                    disableMouse = false,
                    disableCombat = true,
                }, {}, {}, {}, function() -- Done
                    TriggerServerEvent("DGCore:Server:RemoveItem", 'nitrous', 1)
                    local CurrentVehicle = GetVehiclePedIsIn(PlayerPedId())
                    local Plate = GetVehicleNumberPlateText(CurrentVehicle)
                    TriggerServerEvent('nitrous:server:LoadNitrous', Plate)
                end)
            else
                DGCore.Functions.Notify("You cannot do that from this seat!", "error")
            end
        else
            DGCore.Functions.Notify('You\'re Not In A Car', 'error')
        end
    else
        DGCore.Functions.Notify('You Already Have NOS Active', 'error')
    end
end)

local nosupdated = false

Citizen.CreateThread(function()
    while true do
        local IsInVehicle = IsPedInAnyVehicle(PlayerPedId())
        local CurrentVehicle = GetVehiclePedIsIn(PlayerPedId())
        if IsInVehicle then
            local Plate = GetVehicleNumberPlateText(CurrentVehicle)
            if VehicleNitrous[Plate] ~= nil then
                if VehicleNitrous[Plate].hasnitro then
                    if IsControlJustPressed(0, 36) and GetPedInVehicleSeat(CurrentVehicle, -1) == PlayerPedId() then
                        local speed = GetEntitySpeed(GetVehiclePedIsIn(PlayerPedId(), false)) * 2.2369
                        SetVehicleEnginePowerMultiplier(CurrentVehicle, NitrousBoost)
                        SetVehicleEngineTorqueMultiplier(CurrentVehicle, NitrousBoost)
                        SetEntityMaxSpeed(vehicle, 999.0)
                        NitrousActivated = true

                        Citizen.CreateThread(function()
                            while NitrousActivated do
                                if VehicleNitrous[Plate].level - 1 ~= 0 then
                                    TriggerServerEvent('nitrous:server:UpdateNitroLevel', Plate, (VehicleNitrous[Plate].level - 1))
                                    TriggerEvent('hud:client:UpdateNitrous', VehicleNitrous[Plate].hasnitro,  VehicleNitrous[Plate].level, true)
                                else
                                    TriggerServerEvent('nitrous:server:UnloadNitrous', Plate)
                                    NitrousActivated = false
                                    SetVehicleBoostActive(CurrentVehicle, 0)
                                    SetVehicleEnginePowerMultiplier(CurrentVehicle, LastEngineMultiplier)
                                    SetVehicleEngineTorqueMultiplier(CurrentVehicle, 1.0)
                                    StopScreenEffect("RaceTurbo")
                                    ScreenEffect = false
                                    for index,_ in pairs(Fxs) do
                                        StopParticleFxLooped(Fxs[index], 1)
                                        TriggerServerEvent('nitrous:server:StopSync', GetVehicleNumberPlateText(CurrentVehicle))
                                        Fxs[index] = nil
                                    end
                                end
                                Citizen.Wait(100)
                            end
                        end)
                    end

                    if IsControlJustReleased(0, 36) and GetPedInVehicleSeat(CurrentVehicle, -1) == PlayerPedId() then
                        if NitrousActivated then
                            local veh = GetVehiclePedIsIn(PlayerPedId())
                            SetVehicleBoostActive(veh, 0)
                            SetVehicleEnginePowerMultiplier(veh, LastEngineMultiplier)
                            SetVehicleEngineTorqueMultiplier(veh, 1.0)
                            for index,_ in pairs(Fxs) do
                                StopParticleFxLooped(Fxs[index], 1)
                                TriggerServerEvent('nitrous:server:StopSync', GetVehicleNumberPlateText(veh))
                                Fxs[index] = nil
                            end
                            StopScreenEffect("RaceTurbo")
                            TriggerEvent('hud:client:UpdateNitrous', VehicleNitrous[Plate].hasnitro,  VehicleNitrous[Plate].level, false)
                            NitrousActivated = false
                        end
                    end
                end
            else
                if not nosupdated then
                    TriggerEvent('hud:client:UpdateNitrous', false, nil, false)
                    nosupdated = true
                end
                StopScreenEffect("RaceTurbo")
            end
        else
            if nosupdated then
                nosupdated = false
            end
            StopScreenEffect("RaceTurbo")
            Citizen.Wait(1500)
        end
        Citizen.Wait(3)
    end
end)

p_flame_location = {
	"exhaust",
	"exhaust_2",
	"exhaust_3",
	"exhaust_4",
	"exhaust_5",
	"exhaust_6",
	"exhaust_7",
	"exhaust_8",
	"exhaust_9",
	"exhaust_10",
	"exhaust_11",
	"exhaust_12",
	"exhaust_13",
	"exhaust_14",
	"exhaust_15",
	"exhaust_16",
}

local bonesindex = {
    "chassis",
    "windscreen",
    "seat_pside_r",
    "seat_dside_r",
    "bodyshell",
    "suspension_lm",
    "suspension_lr",
    "platelight",
    "attach_female",
    "attach_male",
    "bonnet",
    "boot",
    "chassis_dummy",
    "chassis_Control",
    "door_dside_f",
    "door_dside_r",
    "door_pside_f",
    "door_pside_r",
    "Gun_GripR",
    "windscreen_f",
    "platelight",
    "VFX_Emitter",
    "window_lf",
    "window_lr",
    "window_rf",
    "window_rr",
    "engine",
    "gun_ammo",
    "ROPE_ATTATCH",
    "wheel_lf",
    "wheel_lr",
    "wheel_rf",
    "wheel_rr",
    "exhaust",
    "overheat",
    "misc_e",
    "seat_dside_f",
    "seat_pside_f",
    "Gun_Nuzzle",
    "seat_r",
}

ParticleDict = "veh_xs_vehicle_mods"
ParticleFx = "veh_nitrous"
ParticleSize = 1.4

Citizen.CreateThread(function()
    while true do
        if NitrousActivated then
            local veh = GetVehiclePedIsIn(PlayerPedId())
            if veh ~= 0 then
                TriggerServerEvent('nitrous:server:SyncFlames', VehToNet(veh))
                SetVehicleBoostActive(veh, 1)
                StartScreenEffect("RaceTurbo", 0.0, 0)

                for _,bones in pairs(p_flame_location) do
                    if GetEntityBoneIndexByName(veh, bones) ~= -1 then
                        if Fxs[bones] == nil then
                            RequestNamedPtfxAsset(ParticleDict)
                            while not HasNamedPtfxAssetLoaded(ParticleDict) do
                                Citizen.Wait(0)
                            end
                            SetPtfxAssetNextCall(ParticleDict)
                            UseParticleFxAssetNextCall(ParticleDict)
                            Fxs[bones] = StartParticleFxLoopedOnEntityBone(ParticleFx, veh, 0.0, -0.02, 0.0, 0.0, 0.0, 0.0, GetEntityBoneIndexByName(veh, bones), ParticleSize, 0.0, 0.0, 0.0)
                        end
                    end
                end
            end
        end
        Citizen.Wait(0)
    end
end)

local NOSPFX = {}

RegisterNetEvent('nitrous:client:SyncFlames')
AddEventHandler('nitrous:client:SyncFlames', function(netid, nosid)
    local veh = NetToVeh(netid)
    if veh ~= 0 then
        local myid = GetPlayerServerId(PlayerId())
        if NOSPFX[GetVehicleNumberPlateText(veh)] == nil then
            NOSPFX[GetVehicleNumberPlateText(veh)] = {}
        end
        if myid ~= nosid then
            for _,bones in pairs(p_flame_location) do
                if NOSPFX[GetVehicleNumberPlateText(veh)][bones] == nil then
                    NOSPFX[GetVehicleNumberPlateText(veh)][bones] = {}
                end
                if GetEntityBoneIndexByName(veh, bones) ~= -1 then
                    if NOSPFX[GetVehicleNumberPlateText(veh)][bones].pfx == nil then
                        RequestNamedPtfxAsset(ParticleDict)
                        while not HasNamedPtfxAssetLoaded(ParticleDict) do
                            Citizen.Wait(0)
                        end
                        SetPtfxAssetNextCall(ParticleDict)
                        UseParticleFxAssetNextCall(ParticleDict)
                        NOSPFX[GetVehicleNumberPlateText(veh)][bones].pfx = StartParticleFxLoopedOnEntityBone(ParticleFx, veh, 0.0, -0.05, 0.0, 0.0, 0.0, 0.0, GetEntityBoneIndexByName(veh, bones), ParticleSize, 0.0, 0.0, 0.0)

                    end
                end
            end
        end
    end
end)

RegisterNetEvent('nitrous:client:StopSync')
AddEventHandler('nitrous:client:StopSync', function(plate)
    for k, v in pairs(NOSPFX[plate]) do
        StopParticleFxLooped(v.pfx, 1)
        NOSPFX[plate][k].pfx = nil
    end
end)

RegisterNetEvent('nitrous:client:UpdateNitroLevel')
AddEventHandler('nitrous:client:UpdateNitroLevel', function(Plate, level)
    VehicleNitrous[Plate].level = level
end)

RegisterNetEvent('nitrous:client:LoadNitrous')
AddEventHandler('nitrous:client:LoadNitrous', function(Plate)
    VehicleNitrous[Plate] = {
        hasnitro = true,
        level = 100,
    }
    local IsInVehicle = IsPedInAnyVehicle(PlayerPedId())
    local CurrentVehicle = GetVehiclePedIsIn(PlayerPedId())
    local CPlate = GetVehicleNumberPlateText(CurrentVehicle)
    if CPlate == Plate then
        TriggerEvent('hud:client:UpdateNitrous', VehicleNitrous[Plate].hasnitro,  VehicleNitrous[Plate].level, false)
    end
end)

RegisterNetEvent('nitrous:client:UnloadNitrous')
AddEventHandler('nitrous:client:UnloadNitrous', function(Plate)
    VehicleNitrous[Plate] = nil
    
    local CurrentVehicle = GetVehiclePedIsIn(PlayerPedId())
    local CPlate = GetVehicleNumberPlateText(CurrentVehicle)
    if CPlate == Plate then
        NitrousActivated = false
        TriggerEvent('hud:client:UpdateNitrous', false, nil, false)
    end
end)
