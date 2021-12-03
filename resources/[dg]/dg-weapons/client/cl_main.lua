local DGCore = exports['dg-core']:GetCoreObject()
local currentWeaponData = {} 
local canShoot = true
local multiplierAmount = 0
local currentWeapon = nil
local citizenId = nil

AddEventHandler('DGCore:Client:OnPlayerLoaded', function()
    citizenId = DGCore.Functions.GetPlayerData().citizenid
    DGCore.Functions.TriggerCallback("weapons:server:GetConfig", function(repairPoint)
        Config.WeaponRepairPoint.IsRepairing = repairPoint.IsRepairing
        Config.WeaponRepairPoint.RepairingData = repairPoint.RepairingData
    end)
end)

RegisterNetEvent('DGCore:Client:OnPlayerUnload', function()
    Config.WeaponRepairPoint.IsRepairing = false
    Config.WeaponRepairPoint.RepairingData = {}
end)

local function DrawText3Ds(x, y, z, text)
	SetTextScale(0.35, 0.35)
    SetTextFont(4)
    SetTextProportional(1)
    SetTextColour(255, 255, 255, 215)
    SetTextEntry("STRING")
    SetTextCentre(true)
    AddTextComponentString(text)
    SetDrawOrigin(x,y,z, 0)
    DrawText(0.0, 0.0)
    local factor = (string.len(text)) / 370
    DrawRect(0.0, 0.0+0.0125, 0.017+ factor, 0.03, 0, 0, 0, 75)
    ClearDrawOrigin()
end

RegisterNetEvent("weapons:client:SyncRepairShops", function(NewData)
    Config.WeaponRepairPoint.IsRepairing = NewData.IsRepairing
    Config.WeaponRepairPoint.RepairingData = NewData.RepairingData
end)

RegisterNetEvent("addAttachment", function(component)
    local ped = PlayerPedId()
    local weapon = GetSelectedPedWeapon(ped)
    local WeaponData = exports["dg-inventory"]:GetItemData()[weapon]
    GiveWeaponComponentToPed(ped, GetHashKey(WeaponData.name), GetHashKey(component))
end)

RegisterNetEvent('weapons:client:EquipTint', function(tint)
    local player = PlayerPedId()
    local weapon = GetSelectedPedWeapon(player)
    SetPedWeaponTintIndex(player, weapon, tint)
end)

RegisterNetEvent('weapons:client:SetCurrentWeapon', function(data, bool)
    if data ~= false then
        currentWeaponData = data
    else
        currentWeaponData = {}
    end
    canShoot = bool
end)

RegisterNetEvent('weapons:client:SetWeaponQuality', function(amount)
    if currentWeaponData and next(currentWeaponData) then
        TriggerServerEvent("weapons:server:SetWeaponQuality", currentWeaponData, amount)
    end
end)

RegisterNetEvent('weapon:client:AddAmmo', function(type, amount, itemData)
    local ped = PlayerPedId()
    local weapon = GetSelectedPedWeapon(ped)
    if currentWeaponData then
        if exports["dg-inventory"]:GetItemData()[weapon]["name"] ~= "weapon_unarmed" and exports["dg-inventory"]:GetItemData()[weapon]["ammotype"] == type:upper() then
            local total = GetAmmoInPedWeapon(ped, weapon)
            local found, maxAmmo = GetMaxAmmo(ped, weapon)
            if total < maxAmmo then
                DGCore.Functions.Progressbar("taking_bullets", "Loading Bullets", math.random(4000, 6000), false, true, {
                    disableMovement = false,
                    disableCarMovement = false,
                    disableMouse = false,
                    disableCombat = true,
                }, {}, {}, {}, function() -- Done
                    if exports["dg-inventory"]:GetItemData()[weapon] then
                        AddAmmoToPed(ped,weapon,amount)
                        TaskReloadWeapon(ped)
                        TriggerServerEvent("weapons:server:AddWeaponAmmo", currentWeaponData, total + amount)
                        TriggerServerEvent('DGCore:Server:RemoveItem', itemData.name, 1, itemData.slot)
                        TriggerEvent('inventory:client:ItemBox', exports["dg-inventory"]:GetItemData()[itemData.name], "remove")
                        TriggerEvent('DGCore:Notify', 'Reloaded', "success")
                    end
                end, function()
                    DGCore.Functions.Notify("Canceled", "error")
                end)
            else
                DGCore.Functions.Notify("Max Ammo Capacity", "error")
            end
        else
            DGCore.Functions.Notify("You have no weapon.", "error")
        end
    else
        DGCore.Functions.Notify("You have no weapon.", "error")
    end
end)

RegisterNetEvent("weapons:client:EquipAttachment", function(ItemData, attachment)
    local ped = PlayerPedId()
    local weapon = GetSelectedPedWeapon(ped)
    local WeaponData = exports["dg-inventory"]:GetItemData()[weapon]
    if weapon ~= GetHashKey("WEAPON_UNARMED") then
        WeaponData.name = WeaponData.name:upper()
        if WeaponAttachments[WeaponData.name] then
            if WeaponAttachments[WeaponData.name][attachment]['item'] == ItemData.name then
                TriggerServerEvent("weapons:server:EquipAttachment", ItemData, currentWeaponData, WeaponAttachments[WeaponData.name][attachment])
            else
                DGCore.Functions.Notify("This weapon does not support this attachment.", "error")
            end
        end
    else
        DGCore.Functions.Notify("You dont have a weapon in your hand.", "error")
    end
end)

RegisterNetEvent('weapons:client:SetWeaponAmmoManual', function(weapon, ammo)
    local ped = PlayerPedId()
    if weapon ~= "current" then
        local weapon = weapon:upper()
        SetPedAmmo(ped, GetHashKey(weapon), ammo)
        DGCore.Functions.Notify('+'..ammo..' Ammo for the '..exports["dg-inventory"]:GetItemData()[GetHashKey(weapon)]["label"], 'success')
    else
        local weapon = GetSelectedPedWeapon(ped)
        if weapon ~= nil then
            SetPedAmmo(ped, weapon, ammo)
            DGCore.Functions.Notify('+'..ammo..' Ammo for the '..exports["dg-inventory"]:GetItemData()[weapon]["label"], 'success')
        else
            DGCore.Functions.Notify('You dont have a weapon in your hands..', 'error')
        end
    end
end)

RegisterNetEvent("weapons:client:CheckWeapon", function(weaponName)
    local ped = PlayerPedId()
    if currentWeapon == weaponName then
        TriggerEvent("weapons:ResetHolster")
        SetCurrentPedWeapon(ped, `WEAPON_UNARMED`, true)
        RemoveAllPedWeapons(ped, true)
        currentWeapon = nil
    end
end)

RegisterNetEvent("weapons:client:UseWeapon", function(weaponData, shootbool)
    local ped = PlayerPedId()
    local weaponName = tostring(weaponData.name)
    if currentWeapon == weaponName then
        SetCurrentPedWeapon(ped, `WEAPON_UNARMED`, true)
        RemoveAllPedWeapons(ped, true)
        TriggerEvent("weapons:client:SetCurrentWeapon", nil, shootbool)
        currentWeapon = nil
    elseif weaponName == "weapon_stickybomb" then
        GiveWeaponToPed(ped, GetHashKey(weaponName), 1, false, false)
        SetPedAmmo(ped, GetHashKey(weaponName), 1)
        SetCurrentPedWeapon(ped, GetHashKey(weaponName), true)
        TriggerServerEvent("DGCore:Server:RemoveItem", weaponName, 1)
        TriggerEvent("weapons:client:SetCurrentWeapon", weaponData, shootbool)
        currentWeapon = weaponName
    elseif weaponName == "weapon_snowball" then
        GiveWeaponToPed(ped, GetHashKey(weaponName), 10, false, false)
        SetPedAmmo(ped, GetHashKey(weaponName), 10)
        SetCurrentPedWeapon(ped, GetHashKey(weaponName), true)
        TriggerServerEvent("DGCore:Server:RemoveItem", weaponName, 1)
        TriggerEvent("weapons:client:SetCurrentWeapon", weaponData, shootbool)
        currentWeapon = weaponName
    else
        TriggerEvent("weapons:client:SetCurrentWeapon", weaponData, shootbool)
        DGCore.Functions.TriggerCallback("weapon:server:GetWeaponAmmo", function(result)
            local ammo = tonumber(result)
            if weaponName == "weapon_petrolcan" or weaponName == "weapon_fireextinguisher" then
                ammo = 4000
            end
            GiveWeaponToPed(ped, GetHashKey(weaponName), 0, false, false)
            SetPedAmmo(ped, GetHashKey(weaponName), ammo)
            SetCurrentPedWeapon(ped, GetHashKey(weaponName), true)
            if weaponData.info.attachments then
                for _, attachment in pairs(weaponData.info.attachments) do
                    GiveWeaponComponentToPed(ped, GetHashKey(weaponName), GetHashKey(attachment.component))
                end
            end
            currentWeapon = weaponName
        end, currentWeaponData)
    end
end)

CreateThread(function()
    SetWeaponsNoAutoswap(true)
end)

CreateThread(function()
    while true do
        local ped = PlayerPedId()
        if IsPedArmed(ped, 7) == 1 and (IsControlJustReleased(0, 24) or IsDisabledControlJustReleased(0, 24)) then
            local weapon = GetSelectedPedWeapon(ped)
            local ammo = GetAmmoInPedWeapon(ped, weapon)
            TriggerServerEvent("weapons:server:UpdateWeaponAmmo", currentWeaponData, tonumber(ammo))
            if multiplierAmount > 0 then
                TriggerServerEvent("weapons:server:UpdateWeaponQuality", currentWeaponData, multiplierAmount)
                multiplierAmount = 0
            end
        end
        Wait(1)
    end
end)

CreateThread(function()
    Citizen.Wait(500)
    while true do
        if LocalPlayer.state['isLoggedIn'] then
            local ped = PlayerPedId()
            if currentWeaponData and next(currentWeaponData) then
                if IsPedShooting(ped) or IsControlJustPressed(0, 24) then
                    if canShoot then
                        local weapon = GetSelectedPedWeapon(ped)
                        local ammo = GetAmmoInPedWeapon(ped, weapon)
                        if exports["dg-inventory"]:GetItemData()[weapon]["name"] == "weapon_snowball" then
                            TriggerServerEvent('DGCore:Server:RemoveItem', "snowball", 1)
                        elseif exports["dg-inventory"]:GetItemData()[weapon]["name"] == "weapon_pipebomb" then
                            TriggerServerEvent('DGCore:Server:RemoveItem', "weapon_pipebomb", 1)
                        elseif exports["dg-inventory"]:GetItemData()[weapon]["name"] == "weapon_molotov" then
                            TriggerServerEvent('DGCore:Server:RemoveItem', "weapon_molotov", 1)
                        elseif exports["dg-inventory"]:GetItemData()[weapon]["name"] == "weapon_stickybomb" then
                            TriggerServerEvent('DGCore:Server:RemoveItem', "weapon_stickybomb", 1)
                        else
                            if ammo > 0 then
                                multiplierAmount = multiplierAmount + 1
                            end
                        end
                    else
			            local weapon = GetSelectedPedWeapon(ped)
                        if weapon ~= -1569615261 then
                            TriggerEvent('weapons:client:CheckWeapon', exports["dg-inventory"]:GetItemData()[weapon]["name"])
                            DGCore.Functions.Notify("This weapon is broken and can not be used.", "error")
                            multiplierAmount = 0
                        end
                    end
                end
            end
        end
        Wait(1)
    end
end)

CreateThread(function()
    while true do
        if LocalPlayer.state['isLoggedIn'] then
            local inRange = false
            local ped = PlayerPedId()
            local pos = GetEntityCoords(ped)
            local data = Config.WeaponRepairPoint
            local distance = #(pos - data.coords)
            if distance < 10 then
                inRange = true
                if distance < 1 then
                    if data.IsRepairing then
                        if data.RepairingData.CitizenId ~= citizenId then
                            DrawText3Ds(data.coords.x, data.coords.y, data.coords.z, 'The repairshop in this moment is ~r~NOT~w~ useable.')
                        else
                            if not data.RepairingData.Ready then
                                DrawText3Ds(data.coords.x, data.coords.y, data.coords.z, 'Your weapon will be repaired.')
                            else
                                DrawText3Ds(data.coords.x, data.coords.y, data.coords.z, '[E] - Take Weapon Back')
                            end
                        end
                    else
                        if currentWeaponData and next(currentWeaponData) then
                            if not data.RepairingData.Ready then
                                local WeaponData = exports["dg-inventory"]:GetItemData()[GetHashKey(currentWeaponData.name)]
                                local WeaponClass = (DGCore.Shared.SplitStr(WeaponData.ammotype, "_")[2]):lower()
                                DrawText3Ds(data.coords.x, data.coords.y, data.coords.z, '[E] Repair Weapon, ~g~$'..Config.WeaponRepairCotsts[WeaponClass]..'~w~')
                                if IsControlJustPressed(0, 38) then
                                    DGCore.Functions.TriggerCallback('weapons:server:RepairWeapon', function(HasMoney)
                                        if HasMoney then
                                            currentWeaponData = {}
                                        end
                                    end, 1, currentWeaponData)
                                end
                            else
                                if data.RepairingData.CitizenId ~= citizenId then
                                    DrawText3Ds(data.coords.x, data.coords.y, data.coords.z, 'The repairshop is this moment ~r~NOT~w~ useable.')
                                else
                                    DrawText3Ds(data.coords.x, data.coords.y, data.coords.z, '[E] - Take Weapon Back')
                                    if IsControlJustPressed(0, 38) then
                                        TriggerServerEvent('weapons:server:TakeBackWeapon', data)
                                    end
                                end
                            end
                        else
                            if data.RepairingData.CitizenId == nil then
                                DrawText3Ds(data.coords.x, data.coords.y, data.coords.z, 'You dont have a weapon in your hands.')
                            elseif data.RepairingData.CitizenId == citizenId then
                                DrawText3Ds(data.coords.x, data.coords.y, data.coords.z, '[E] - Take Weapon Back')
                                if IsControlJustPressed(0, 38) then
                                    TriggerServerEvent('weapons:server:TakeBackWeapon', data)
                                end
                            end
                        end
                    end
                end
            end
            if not inRange then
                Wait(1000)
            end
        end
        Wait(3)
    end
end)