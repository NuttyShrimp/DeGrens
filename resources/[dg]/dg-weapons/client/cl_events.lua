AddStateBagChangeHandler('isLoggedIn', nil, function(bagName, key, value)
    isLoggedIn = value
end)

AddEventHandler("onResourceStart", function(resourceName)
    if resourceName ~= GetCurrentResourceName() then return end
    isLoggedIn = LocalPlayer.state["isLoggedIn"]
end)

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then return end
    local ped = PlayerPedId()
    RemoveAllPedWeapons(ped, true)
end)

AddEventHandler("DGCore:Client:OnPlayerLoaded", function()
    playerJobName = DGCore.Functions.GetPlayerData().job.name
    DGCore.Functions.TriggerCallback("weapons:server:GetConfig", function(data)
        Config.RepairData = data
    end)
end)

RegisterNetEvent("DGCore:Client:OnPlayerUnload", function()
    Config.RepairData.IsRepairing = false
    Config.RepairData.IsFinished = false
    Config.RepairData.RepairingData = {}
end)

RegisterNetEvent('DGCore:Client:OnJobUpdate')
AddEventHandler('DGCore:Client:OnJobUpdate', function(JobInfo)
    playerJobName = JobInfo.name
end)

RegisterNetEvent("weapons:client:SyncRepairData", function(data)
    Config.RepairData = data
end)

RegisterNetEvent("weapons:client:RemoveWeapon", function(weaponName)
    local ped = PlayerPedId()

    if currentWeaponData and next(currentWeaponData) then
        if weaponName and currentWeaponData.name == weaponName or true then
            holstered = true
            canFire = true
            currWeapon = GetHashKey('WEAPON_UNARMED')
            SetCurrentPedWeapon(ped, `WEAPON_UNARMED`, true)
            RemoveAllPedWeapons(ped, true)
            currentWeaponData = {}
        end
    end
end)

RegisterNetEvent("weapons:client:UseWeapon", function(weaponData, shootbool)
    local ped = PlayerPedId()
    local weaponName = tostring(weaponData.name)
    canShoot = shootbool

    RemoveAllPedWeapons(ped, true)

    if currentWeaponData.name == weaponName then
        currentWeaponData = {}
        if ShouldHolster(weaponName) then HolsterWeapon() end
    else
        if currentWeaponData and next(currentWeaponData) then
            if ShouldHolster(currentWeaponData.name) then HolsterWeapon() end
        end

        currentWeaponData = weaponData
        GiveWeaponToPed(ped, GetHashKey(weaponName), 0, false, false)

        local oneTimeUse = false
        for _, itemName in pairs(Config.OneTimeWeapons) do
            if weaponName == itemName then
                SetPedAmmo(ped, GetHashKey(weaponName), 1)
                oneTimeUse = true
                break
            end
        end

        if not oneTimeUse then
            DGCore.Functions.TriggerCallback("weapons:server:GetWeaponAmmo", function(ammo)
                local ammo = tonumber(ammo)

                if weaponName == "weapon_petrolcan" or weaponName == "weapon_fireextinguisher" then
                    ammo = 4000
                end

                SetPedAmmo(ped, GetHashKey(weaponName), ammo)
                local clipSize = GetMaxAmmoInClip(ped, GetHashKey(weaponName), 1)
                if ammo >= clipSize then
                    SetAmmoInClip(ped, GetHashKey(weaponName), clipSize)
                else
                    SetAmmoInClip(ped, GetHashKey(weaponName), ammo)
                end
            end, currentWeaponData)
        end

        if ShouldHolster(weaponName) then
            UnholsterWeapon(currentWeaponData)
        else
            SetPedWeapon(currentWeaponData)
        end
    end
end)

RegisterNetEvent("weapons:client:SetWeaponQuality", function(amount)
    if currentWeaponData and next(currentWeaponData) then
        TriggerServerEvent("weapons:server:SetWeaponQuality", currentWeaponData, amount)
    else
        DGCore.Functions.Notify("Je hebt geen wapen vast.", "error")
    end
end)

RegisterNetEvent("weapons:client:AddAmmo", function(ammoType, amount, itemData)
    local ped = PlayerPedId()
    local weapon = GetSelectedPedWeapon(ped)
    local weaponData = exports["dg-inventory"]:GetItemData(weapon)

    if currentWeaponData and next(currentWeaponData) then
        if weaponData.name ~= "weapon_unarmed" and weaponData.ammotype == ammoType then
            local currentAmmo = GetAmmoInPedWeapon(ped, weapon)
            local totalAmmo = currentAmmo + amount
            if totalAmmo > 250 then totalAmmo = 250 end

            if currentAmmo < 250 then
                DGCore.Functions.Progressbar("loading_bullets", "Kogels bijladen...", Config.ReloadTime, false, true, {
                    disableMovement = false,
                    disableCarMovement = false,
                    disableMouse = false,
                    disableCombat = true,
                }, {}, {}, {}, function() -- Done
                    if currentWeaponData and next(currentWeaponData) then
                        AddAmmoToPed(ped, weapon, amount)

                        TriggerServerEvent("weapons:server:SaveWeaponAmmo", currentWeaponData, tonumber(totalAmmo))
                        TriggerServerEvent("DGCore:Server:RemoveItem", itemData.name, 1, itemData.slot)
                        TriggerEvent("inventory:client:ItemBox", itemData.name, "remove")
                        DGCore.Functions.Notify("Kogels bijgeladen.", "success")
                    else
                        DGCore.Functions.Notify("Je hebt geen wapen vast.", "error")
                    end
                end, function()
                    DGCore.Functions.Notify("Geannuleerd...", "error")
                end)
            else
                DGCore.Functions.Notify("Je wapen zit vol.", "error")
            end
        else
            DGCore.Functions.Notify("Je hebt geen wapen vast.", "error")
        end
    else
        DGCore.Functions.Notify("Je hebt geen wapen vast.", "error")
    end
end)

RegisterNetEvent("weapons:client:SetAmmoManual", function(ammo)
    local ped = PlayerPedId()
    local weapon = GetSelectedPedWeapon(ped)

    if currentWeaponData and next(currentWeaponData) then
        if weapon then
            SetPedAmmo(ped, weapon, ammo)
            TriggerServerEvent("weapons:server:SaveWeaponAmmo", currentWeaponData, ammo)
            DGCore.Functions.Notify("+"..ammo.." Ammo voor "..exports["dg-inventory"]:GetItemData(weapon).label, "success")
        else
            DGCore.Functions.Notify("Je hebt geen wapen vast.", "error")
        end
    end
end)

RegisterNetEvent("weapons:client:EquipAttachment", function(itemData, attachment)
    local ped = PlayerPedId()
    local weapon = GetSelectedPedWeapon(ped)

    if weapon ~= GetHashKey("WEAPON_UNARMED") then
        local weaponData = exports["dg-inventory"]:GetItemData(weapon)
        weaponData.name = weaponData.name:upper()

        if WeaponAttachments[weaponData.name] then
            if WeaponAttachments[weaponData.name][attachment].item == itemData.name then
                TriggerServerEvent("weapons:server:EquipAttachment", itemData, currentWeaponData, WeaponAttachments[weaponData.name][attachment])
            else
                DGCore.Functions.Notify("Je wapen ondersteunt deze attachment niet.", "error")
            end
        end
    else
        DGCore.Functions.Notify("Je hebt geen wapen vast.", "error")
    end
end)

RegisterNetEvent("weapons:client:AddAttachment", function(component)
    local ped = PlayerPedId()
    local weapon = GetSelectedPedWeapon(ped)
    local weaponData = exports["dg-inventory"]:GetItemData(weapon)
    GiveWeaponComponentToPed(ped, GetHashKey(weaponData.name), GetHashKey(component))
end)

AddEventHandler("weapons:client:SelectTint", function()
    exports["dg-ui"]:openApplication('contextmenu',{
        {
            title = "Wapen tinten",
            description = "Selecteer een kleur voor je wapen.",
        },
        {
            title = "Origineel",
            callbackURL = "weapons:client:ApplyTint",
            data = {tint = 0},
        },
        {
            title = "Groen",
            callbackURL = "weapons:client:ApplyTint",
            data = {tint = 1},
        },
        {
            title = "Goud",
            callbackURL = "weapons:client:ApplyTint",
            data = {tint = 2},
        },
        {
            title = "Roos",
            callbackURL = "weapons:client:ApplyTint",
            data = {tint = 3},
        },
        {
            title = "Leger",
            callbackURL = "weapons:client:ApplyTint",
            data = {tint = 4},
        },
        {
            title = "Politie",
            callbackURL = "weapons:client:ApplyTint",
            data = {tint = 5},
        },
        {
            title = "Oranje",
            callbackURL = "weapons:client:ApplyTint",
            data = {tint = 6},
        },
        {
            title = "Platinum",
            callbackURL = "weapons:client:ApplyTint",
            data = {tint = 7},
        },
    })
end)

RegisterUICallback("weapons:client:ApplyTint", function(data)
    exports["dg-ui"]:closeApplication('contextmenu')

    local ped = PlayerPedId()
    local weapon = GetSelectedPedWeapon(ped)
    SetPedWeaponTintIndex(ped, weapon, data.tint)
    TriggerServerEvent("weapons:server:ApplyTint", currentWeaponData, data.tint)
end)

AddEventHandler("weapons:client:GiveWeaponToRepair", function()
    if not Config.RepairData.IsRepairing and not Config.RepairData.IsFinished then
        if currentWeaponData and next(currentWeaponData) then
            DGCore.Functions.TriggerCallback("weapons:server:RepairWeapon", function(hasMoney)
                if hasMoney then
                    currentWeaponData = {}
                end
            end, currentWeaponData)
        end
    end
end)

AddEventHandler("weapons:client:TakeWeaponFromRepair", function()
    if not Config.RepairData.IsRepairing and Config.RepairData.IsFinished then
        TriggerServerEvent("weapons:server:TakeBackWeapon")
    end
end)