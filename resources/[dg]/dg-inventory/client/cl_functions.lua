exports("GetItemData", function(item)
    return ItemData[item]
end)

function LoadAnimDict(dict)
    while not HasAnimDictLoaded(dict) do
        RequestAnimDict(dict)
        Citizen.Wait(5)
    end
end

function OpenAnimation()
    LoadAnimDict("amb@prop_human_bum_bin@idle_b")
    TaskPlayAnim(PlayerPedId(), "amb@prop_human_bum_bin@idle_b", "idle_d", 4.0, 4.0, -1, 50, 0, false, false, false)
end

function CloseAnimation()
    LoadAnimDict("amb@prop_human_bum_bin@idle_b")
    TaskPlayAnim(PlayerPedId(), "amb@prop_human_bum_bin@idle_b", "exit", 4.0, 4.0, -1, 50, 0, false, false, false)
end

function OpenTrunk(vehicle)
    OpenAnimation()
    SetVehicleDoorOpen(vehicle, 5, false, false)
end

function CloseTrunk()
    CloseAnimation()
    local vehicle = DGCore.Functions.GetClosestVehicle()
    SetVehicleDoorShut(vehicle, 5, false)
end

function closeInventory()
    SendNUIMessage({
        action = "close",
    })
end

function AllowedToOpenInv() 
    local Player = DGCore.Functions.GetPlayerData()
    if not Player.metadata["isdead"] and not Player.metadata["inlaststand"] and not Player.metadata["ishandcuffed"] and not IsPauseMenuActive() then
        return true
    end
    return false
end

function FormatWeaponAttachments(itemdata)
    local attachments = {}
    itemdata.name = itemdata.name:upper()
    if itemdata.info.attachments and next(itemdata.info.attachments) then
        for k, v in pairs(itemdata.info.attachments) do
            if WeaponAttachments[itemdata.name] then
                for key, value in pairs(WeaponAttachments[itemdata.name]) do
                    if value.component == v.component then
                        attachments[#attachments+1] = {
                            attachment = key,
                            label = value.label
                        }
                    end
                end
            end
        end
    end
    return attachments
end

function PlayInvAnim()
    Citizen.CreateThread(function()
        LoadAnimDict('pickup_object')
        TaskPlayAnim(PlayerPedId(),'pickup_object', 'putdown_low', 5.0, 1.5, 1.0, 48, 0.0, 0, 0, 0)
        Wait(1000)
        ClearPedSecondaryTask(PlayerPedId())
    end)
end

holdObject = function()
    LoadAnimDict("anim@heists@box_carry@")
    Citizen.CreateThread(function()
        while holdingObject do
            if not IsEntityPlayingAnim(ped, "anim@heists@box_carry@", "idle", 3) then
                TaskPlayAnim(ped, "anim@heists@box_carry@", "idle", 2.0, 2.0, -1, 51, 0, false, false, false)
            end
            Citizen.Wait(500)
        end
    end)
end