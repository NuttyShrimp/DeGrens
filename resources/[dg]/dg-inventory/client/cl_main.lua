DGCore = exports['dg-core']:GetCoreObject()

ItemData = {}

inInventory = false
currentWeapon = nil
CurrentWeaponData = {}
currentOtherInventory = nil
currentGivePlayer = nil

Dumpsters = {}
Drops = {}
DropsNear = {}

Current = {
    ["trunk"] = nil,
    ["glovebox"] = nil,
    ["stash"] = nil,
    ["drop"] = nil,
    ["dumpster"] = nil,
    ["give"] = nil,
}

Citizen.CreateThread(function()
    DGCore.Functions.TriggerCallback("inventory:server:SetupData", function(callback)
        ItemData = callback[1]
        Dumpsters = callback[2]
        Drops = callback[3]
    end)
end)

-- register 1 to 5 keybinds
Citizen.CreateThread(function()
    for i= 1, 5 do
        RegisterCommand("slot" .. i, function()
            if AllowedToOpenInv() then
                TriggerServerEvent("inventory:server:UseItemSlot", i)
            end
        end)
        RegisterKeyMapping("slot" .. i, "Uses the item in slot " .. i, "keyboard", i)
    end
end)

-- set blip at close drops
Citizen.CreateThread(function()
    while true do
        if DropsNear then
            for k, v in pairs(DropsNear) do
                if DropsNear[k] then
                    DrawMarker(2, v.coords.x, v.coords.y, v.coords.z - 0.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.2, 0.1, 30, 202, 255, 100, false, false, false, true, false, false, false)
                end
            end
        end

        Citizen.Wait(1)
    end
end)

-- look for drops near player
Citizen.CreateThread(function()
    while true do
        if Drops and next(Drops) then
            local pos = GetEntityCoords(PlayerPedId(), true)

            for k, v in pairs(Drops) do
                if Drops[k] then
                    local dist = #(pos - vector3(v.coords.x, v.coords.y, v.coords.z))

                    if dist < 7.5 then
                        DropsNear[k] = v

                        if dist < 2 then
                            Current["drop"] = k
                        else
                            Current["drop"] = nil
                        end
                    else
                        DropsNear[k] = nil
                    end
                end
            end
        else
            DropsNear = {}
        end

        Citizen.Wait(500)
    end
end)

RegisterCommand("inventory", function()
    if not inInventory and AllowedToOpenInv() then
        local ped = PlayerPedId()
        local curVeh = nil

        if IsPedInAnyVehicle(ped, false) then
            local vehicle = GetVehiclePedIsIn(ped, false)
            Current["glovebox"] = GetVehicleNumberPlateText(vehicle)
            curVeh = vehicle
            Current["trunk"] = nil
        else
            local vehicle = DGCore.Functions.GetClosestVehicle()

            if vehicle ~= 0 and vehicle then
                local pos = GetEntityCoords(ped)
                local trunkpos = GetOffsetFromEntityInWorldCoords(vehicle, 0, -2.5, 0)
                
                if #(pos - trunkpos) < 2.0 and not IsPedInAnyVehicle(ped) then
                    if GetVehicleDoorLockStatus(vehicle) < 2 then
                        Current["trunk"] = GetVehicleNumberPlateText(vehicle)
                        curVeh = vehicle
                        Current["glovebox"] = nil
                    else
                        DGCore.Functions.Notify("Vehicle Locked", "error")
                        return
                    end
                else
                    Current["trunk"] = nil
                end
            else
                Current["trunk"] = nil
            end
        end

        if Current["trunk"] then                
            local other = {}
            local vehicleClass = GetVehicleClass(curVeh)
            local vehicleModel = GetEntityModel(curVeh)

            if Config.TrunkSize.SpecificModels and Config.TrunkSize.SpecificModels[vehicleModel] then
                other = Config.TrunkSize.SpecificModels[vehicleModel]
            elseif Config.TrunkSize.Classes and Config.TrunkSize.Classes[vehicleClass] then
                other = Config.TrunkSize.Classes[vehicleClass]
            else
                other = Config.TrunkSize.Default
            end

            TriggerServerEvent("inventory:server:OpenInventory", "trunk", Current["trunk"], other)
            OpenTrunk(curVeh)
        elseif Current["glovebox"] then
            TriggerServerEvent("inventory:server:OpenInventory", "glovebox", Current["glovebox"])
            PlayInvAnim()
        elseif Current["drop"] then
            TriggerServerEvent("inventory:server:OpenInventory", "drop", Current["drop"])
            PlayInvAnim()
        else
            TriggerServerEvent("inventory:server:OpenInventory")
            PlayInvAnim()
        end
    end
end)
RegisterKeyMapping("inventory", "Open Inventory", "keyboard", "TAB")

-- CloseInventory very rare if scuff
RegisterCommand("closeinv", function()
    closeInventory()
end, false)

RegisterNUICallback("GetWeaponData", function(data, cb)
    local data = {
        WeaponData = GetItemData()[data.weapon],
        AttachmentData = FormatWeaponAttachments(data.ItemData)
    }
    cb(data)
end)

RegisterNUICallback("RemoveAttachment", function(data, cb)
    local ped = PlayerPedId()
    local WeaponData = GetItemData()[data.WeaponData.name]
    local Attachment = WeaponAttachments[WeaponData.name:upper()][data.AttachmentData.attachment]

    DGCore.Functions.TriggerCallback("weapons:server:RemoveAttachment", function(NewAttachments)
        if NewAttachments ~= false then
            local Attachies = {}
            RemoveWeaponComponentFromPed(ped, GetHashKey(data.WeaponData.name), GetHashKey(Attachment.component))
            for k, v in pairs(NewAttachments) do
                for wep, pew in pairs(WeaponAttachments[WeaponData.name:upper()]) do
                    if v.component == pew.component then
                        Attachies[#Attachies + 1] = {
                            attachment = pew.item,
                            label = pew.label,
                        }
                    end
                end
            end
            local DJATA = {
                Attachments = Attachies,
                WeaponData = WeaponData,
            }
            cb(DJATA)
        else
            RemoveWeaponComponentFromPed(ped, GetHashKey(data.WeaponData.name), GetHashKey(Attachment.component))
            cb({})
        end
    end, data.AttachmentData, data.WeaponData)
end)

RegisterNUICallback("CloseInventory", function(data, cb)
    if currentOtherInventory == "none-inv" then
        Current["drop"] = nil
        Current["trunk"] = nil
        Current["glovebox"] = nil
        Current["stash"] = nil
        Current["dumpster"] = nil
        SetNuiFocus(false, false)
        inInventory = false
        ClearPedTasks(PlayerPedId())
        return
    end

    if Current["trunk"] then
        CloseTrunk()
        TriggerServerEvent("inventory:server:SaveInventory", "trunk", Current["trunk"])
        Current["trunk"] = nil
    elseif Current["glovebox"] then
        TriggerServerEvent("inventory:server:SaveInventory", "glovebox", Current["glovebox"])
        Current["glovebox"] = nil
    elseif Current["stash"] then
        TriggerServerEvent("inventory:server:SaveInventory", "stash", Current["stash"])
        Current["stash"] = nil
    elseif Current["dumpster"] then
        CloseAnimation()
        TriggerServerEvent("inventory:server:SaveInventory", "dumpster", Current["dumpster"])
        Current["dumpster"] = nil
    elseif Current["drop"] then
        TriggerServerEvent("inventory:server:SaveInventory", "drop", Current["drop"])
        Current["drop"] = nil
    elseif Current["give"] then
        TriggerServerEvent("inventory:server:SaveInventory", "give", Current["give"])
    end

    SetNuiFocus(false, false)
    inInventory = false
end)

RegisterNUICallback("UseItem", function(data, cb)
    TriggerServerEvent("inventory:server:UseItem", data.inventory, data.item)
end)

RegisterNUICallback("getCombineItem", function(data, cb)
    cb(GetItemData()[data.item])
end)

RegisterNUICallback("combineItem", function(data)
    Citizen.Wait(150)
    TriggerServerEvent("inventory:server:CombineItem", data.reward, data.fromItem, data.toItem)
end)

RegisterNUICallback("combineWithAnim", function(data)
    local ped = PlayerPedId()
    local combineData = data.combineData
    local aDict = combineData.anim.dict
    local aLib = combineData.anim.lib
    local animText = combineData.anim.text
    local animTimeout = combineData.anim.timeOut

    DGCore.Functions.Progressbar("combine_anim", animText, animTimeout, false, true, {
        disableMovement = false,
        disableCarMovement = true,
        disableMouse = false,
        disableCombat = true,
    }, {
        animDict = aDict,
        anim = aLib,
        flags = 16,
    }, {}, {}, function() -- Done
        StopAnimTask(ped, aDict, aLib, 1.0)
        TriggerServerEvent("inventory:server:CombineItem", combineData.reward, data.requiredItem, data.usedItem)
    end, function() -- Cancel
        StopAnimTask(ped, aDict, aLib, 1.0)
        DGCore.Functions.Notify("Failed!", "error")
    end)
end)

RegisterNUICallback("SetInventoryData", function(data, cb)
    TriggerServerEvent("inventory:server:SetInventoryData", data.fromInventory, data.toInventory, data.fromSlot, data.toSlot, data.fromAmount, data.toAmount)
end)

RegisterNUICallback("PlayDropSound", function(data, cb)
    PlaySound(-1, "CLICK_BACK", "WEB_NAVIGATION_SOUNDS_PHONE", 0, 0, 1)
end)

RegisterNUICallback("PlayDropFail", function(data, cb)
    PlaySound(-1, "Place_Prop_Fail", "DLC_Dmod_Prop_Editor_Sounds", 0, 0, 1)
end)

RegisterNUICallback("Notify", function(data, cb)
    DGCore.Functions.Notify(data.message, data.type)
end)