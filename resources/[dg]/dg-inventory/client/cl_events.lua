DGCore = exports['dg-core']:GetCoreObject()

RegisterNetEvent("DGCore:Client:OnPlayerLoaded")
AddEventHandler("DGCore:Client:OnPlayerLoaded", function()
    LocalPlayer.state:set("inv_busy", false, true)
end)

RegisterNetEvent("DGCore:Client:OnPlayerUnload")
AddEventHandler("DGCore:Client:OnPlayerUnload", function()
    LocalPlayer.state:set("inv_busy", true, true)
end)

RegisterNetEvent("inventory:client:CheckOpenState")
AddEventHandler("inventory:client:CheckOpenState", function(invType, id, label)
    local name = DGCore.Shared.SplitStr(label, "-")[2]
    
    if name ~= Current[invType] or Current[invType] == nil then
        TriggerServerEvent("inventory:server:SetIsOpenState", false, invType, id)
    end
end)

RegisterNetEvent("weapons:client:SetCurrentWeapon")
AddEventHandler("weapons:client:SetCurrentWeapon", function(data, bool)
    if data ~= false then
        CurrentWeaponData = data
    else
        CurrentWeaponData = {}
    end
end)

RegisterNetEvent("randPickupAnim")
AddEventHandler("randPickupAnim", function()
    LoadAnimDict("pickup_object")
    TaskPlayAnim(PlayerPedId(),"pickup_object", "putdown_low",5.0, 1.5, 1.0, 48, 0.0, 0, 0, 0)
    Wait(800)
    ClearPedTasks(PlayerPedId())
end)

RegisterNetEvent("inventory:client:ItemBox")
AddEventHandler("inventory:client:ItemBox", function(itemData, type)
    SendNUIMessage({
        action = "itemBox",
        item = itemData,
        type = type,
    })
end)

RegisterNetEvent("inventory:client:requiredItems")
AddEventHandler("inventory:client:requiredItems", function(items, bool)
    local itemTable = {}

    if bool then
        for k, v in pairs(items) do
            itemTable[#itemTable+1] = {
                item = items[k].name,
                label = GetItemData()[items[k].name]["label"],
                image = items[k].image,
            }
        end
    end

    SendNUIMessage({
        action = "requiredItem",
        items = itemTable,
        toggle = bool
    })
end)

RegisterNetEvent("inventory:client:OpenInventory")
AddEventHandler("inventory:client:OpenInventory", function(PlayerAmmo, inventory, other)
    if not IsEntityDead(PlayerPedId()) then
        SetNuiFocus(true, true)

        if other then
            currentOtherInventory = other.name
        end

        SendNUIMessage({
            action = "open",
            inventory = inventory,
            slots = Config.MaxInventorySlots,
            other = other,
            maxweight = DGCore.Config.Player.MaxWeight,
            Ammo = PlayerAmmo,
            maxammo = Config.MaximumAmmoValues,
        })
        
        inInventory = true
    end
end)

RegisterNetEvent("inventory:client:UseWeapon")
AddEventHandler("inventory:client:UseWeapon", function(weaponData, shootbool)
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
        end, CurrentWeaponData)
    end
end)

RegisterNetEvent("inventory:client:CheckWeapon")
AddEventHandler("inventory:client:CheckWeapon", function(weaponName)
    local ped = PlayerPedId()
    if currentWeapon == weaponName then
        TriggerEvent("weapons:ResetHolster")
        SetCurrentPedWeapon(ped, `WEAPON_UNARMED`, true)
        RemoveAllPedWeapons(ped, true)
        currentWeapon = nil
    end
end)

RegisterNetEvent("inventory:client:AddDropItem")
AddEventHandler("inventory:client:AddDropItem", function(dropId, player, coords)
    local forward = GetEntityForwardVector(GetPlayerPed(GetPlayerFromServerId(player)))
	local x, y, z = table.unpack(coords + forward * 0.5)
    Drops[dropId] = {
        id = dropId,
        coords = {
            x = x,
            y = y,
            z = z - 0.3,
        },
    }
end)

RegisterNetEvent("inventory:client:RemoveDropItem")
AddEventHandler("inventory:client:RemoveDropItem", function(dropId)
    Drops[dropId] = nil
    DropsNear[dropId] = nil
end)

RegisterNetEvent("inventory:client:DropItemAnim")
AddEventHandler("inventory:client:DropItemAnim", function()
    local ped = PlayerPedId()
    SendNUIMessage({
        action = "close",
    })
    LoadAnimDict("pickup_object")
    TaskPlayAnim(ped, "pickup_object" ,"pickup_low" ,8.0, -8.0, -1, 1, 0, false, false, false )
    Citizen.Wait(2000)
    ClearPedTasks(ped)
end)

RegisterNetEvent("inventory:client:SetCurrentStash")
AddEventHandler("inventory:client:SetCurrentStash", function(stash)
    Current["stash"] = stash
end)

AddEventHandler("inventory:client:OpenDumpster", function(pos)
    OpenAnimation()

    local closestDumpster = nil
    for id, Dumpster in pairs(Dumpsters) do
        if #(vector3(Dumpster.coords.x, Dumpster.coords.y, Dumpster.coords.z) - pos) < 1 then
            closestDumpster = id
        end
    end

    if not closestDumpster then
        closestDumpster = math.floor((pos.x^2 + pos.y^2 + pos.z^2)^2 / math.random(100)) -- generate ID based on location
    end

    Current["dumpster"] = closestDumpster
    Dumpsters[closestDumpster] = {id = closestDumpster, coords = {x = pos.x, y = pos.y, z = pos.z}}

    TriggerServerEvent("inventory:server:SaveDumpster", Dumpsters[closestDumpster])
    TriggerServerEvent("inventory:server:OpenInventory", "dumpster", Current["dumpster"])
end)

AddEventHandler("inventory:server:GiveItemToPlayer", function(player)
    currentGivePlayer = player

    DGCore.Functions.TriggerCallback("inventory:server:CreateId", function(callback)
        Current["give"] = callback
    end, "give")

    Citizen.Wait(200) -- wait for callback

    TriggerServerEvent("inventory:server:OpenInventory", "give", Current["give"])
end)

RegisterNetEvent("inventory:client:ClosedGiveInventory")
AddEventHandler("inventory:client:ClosedGiveInventory", function(inventories)
    if Current["give"] then
        TriggerServerEvent("inventory:server:ReceiveItem", currentGivePlayer, inventories[Current["give"]].items[1])
        Current["give"] = nil
    end
end)