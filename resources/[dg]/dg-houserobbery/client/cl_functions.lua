exports("UnlockDoor", function(houseId)
    local hasCrowbar = exports['dg-weapons']:GetCurrentWeaponData().name == "weapon_crowbar"
    local hasLockpick
    if not hasCrowbar then
        hasCrowbar = DGCore.Functions.TriggerCallback('DGCore:HasItem', nil, 'lockpick')
    end
    
    -- delay if using lockpick to call police
    if hasCrowbar then
        CallCops(houseId)
    else
        Citizen.SetTimeout(1000 * 60 * 3, function()
            CallCops(houseId)
        end)
    end

    if hasLockpick or hasCrowbar then
        exports["dg-keygame"]:OpenGame(function(success)
            CreateEvidence()
            
            if success then
                DGCore.Functions.Notify('De deur is los!', 'success')
                TriggerServerEvent('dg-houserobbery:server:UpdateDoor', houseId, true)
            else
                CallCops(houseId)
                DGCore.Functions.Notify('Mislukt...', 'error')
                if hasLockpick then
                    local rng = math.random(1, 100)
                    if rng <= Config.Lockpick.BreakChance then
                        TriggerServerEvent("DGCore:Server:RemoveItem", 'lockpick', 1)
                        TriggerEvent('inventory:client:ItemBox', "lockpick", "remove")
                        DGCore.Functions.Notify('Je lockpick is gebroken...', 'error')
                    end  
                end
            end
        end, Config.Lockpick.Amount, Config.Lockpick.Difficulty)
    else
        DGCore.Functions.Notify("Hoe ga je dit openen?", "error")
    end
end)

exports('CanUnlockDoor', function(houseId)
    return LocalPlayer.state.houseRobSignedIn and not Config.Houses[houseId].data.unlocked and selectedForHouse == houseId
end)

exports('EnterHouse', function(houseId)
    insideHouse = houseId

    TriggerServerEvent("InteractSound_SV:PlayOnSource", "houses_door_open", 0.25)
    DoorAnimation()
    houseObjects = CreateRobberyHouse(Config.Houses[insideHouse].type, Config.Houses[insideHouse].coords - Config.ZOffset)
    TriggerEvent('dg-weathersync:client:DisableSync')

    local interiorData = Config.Interiors[Config.Houses[insideHouse].type]

    -- add exit option
    local exitPos = Config.Houses[insideHouse].coords - interiorData.exit.offset
    exports["dg-polyzone"]:AddBoxZone("houserobbery_exit", exitPos, 1.3, 1.3, {
        heading = interiorData.exit.heading,
        minZ = exitPos.z - 2,
        maxZ = exitPos.z + 2,
    })

    -- add all search location
    for k, v in pairs(interiorData.lootables) do
        cacheIds.loot[#cacheIds.loot+1] = exports['dg-peek']:addModelEntry(v, {
            options = {
                {
                    icon = "fas fa-search",
                    label = "Doorzoek",
                    action = function(entry)
                        exports['dg-houserobbery']:SearchLocation(entry.lootId)
                    end,
                    canInteract = function(entity, distance, entry)
                        return exports['dg-houserobbery']:CanSearch(entry.lootId)
                    end,
                    lootId = k
                },
            },
            distance = 1.5,
        })
    end

    -- add takeable
    cacheIds.loot[#cacheIds.loot+1] = exports['dg-peek']:addModelEntry(interiorData.takeable.model, {
        options = {
            {
                icon = "fas fa-hand-holding",
                label = "Neem",
                action = function(_, entity)
                    exports['dg-houserobbery']:TakeItem(entity)
                end,
            },
        },
        distance = 1.5,
    })
end)

exports("IsDoorUnlocked", function(houseId)
    return Config.Houses[houseId].data.unlocked
end)

exports("LockDoor", function(houseId)
    TriggerServerEvent('dg-houserobbery:server:UpdateDoor', houseId, false)
    DGCore.Functions.Notify("Je hebt het huis vergrendeld.", "success")
end)

function LeaveHouse()
    TriggerServerEvent("InteractSound_SV:PlayOnSource", "houses_door_open", 0.25)
    DoorAnimation()
    Citizen.Wait(250)
    DoScreenFadeOut(500)
    while not IsScreenFadedOut() do
        Citizen.Wait(10)
    end

    DespawnInterior(houseObjects, function()
        TriggerEvent('dg-weathersync:client:EnableSync')
        Citizen.Wait(250)
        DoScreenFadeIn(250)

        -- tp player
        local ped = PlayerPedId()
        SetEntityCoords(ped, Config.Houses[insideHouse].coords.x, Config.Houses[insideHouse].coords.y, Config.Houses[insideHouse].coords.z)
        SetEntityHeading(ped, Config.Houses[insideHouse].heading + 180)

        -- remove exit location
        exports['dg-polyzone']:removeZone("houserobbery_exit")

        -- remove the search locations
        exports['dg-peek']:removeModelEntry(cacheIds.loot)

        insideHouse = nil
    end)
end

function DoorAnimation()
    local ped = PlayerPedId()
    loadAnimDict("anim@heists@keycard@") 
    TaskPlayAnim(ped, "anim@heists@keycard@", "exit", 5.0, 1.0, -1, 16, 0, 0, 0, 0 )
    Citizen.Wait(400)
    ClearPedTasks(ped)
end

function loadAnimDict(dict)
    while not HasAnimDictLoaded(dict) do
        RequestAnimDict(dict)
        Citizen.Wait(5)
    end
end

exports("CanSearch", function(lootId)
    if Config.Houses[insideHouse].data.searched[lootId] then return false end
    return true
end)

exports('SearchLocation', function(lootId)
    TriggerServerEvent('dg-houserobbery:server:SearchLocation', insideHouse, lootId)

    local wasCancelled, _ = exports['dg-misc']:Taskbar('Plek doorzoeken...', Config.Search.Duration, {
      canCancel = true,
      cancelOnDeath = true,
      disarm = true,
      disableInventory = true,
      controlDisables = {
        movement = true,
        carMovement = true,
        combat = true,
      },
      animation = {
        animDict = "anim@gangops@facility@servers@bodysearch@",
        anim = "player_search",
        flags = 16,
      }
    })
    StopAnimTask(PlayerPedId(), "anim@gangops@facility@servers@bodysearch@", "player_search", 1.0)
    if (wasCancelled) then
        DGCore.Functions.Notify("Geannuleerd...", "error")
        return
    end
    TriggerServerEvent('dg-houserobbery:server:GiveLoot')
    GainStress()
end)

exports("TakeItem", function(entity)
    NetworkRequestControlOfEntity(entity)
    DeleteEntity(entity)
    local takeable = Config.Interiors[Config.Houses[insideHouse].type].takeable
    TriggerServerEvent('dg-houserobbery:server:TakeableTaken', insideHouse, takeable)
end)

exports("SignInOut", function()
    DGCore.Functions.TriggerCallback('police:GetCops', function(amount)
        if amount >= Config.RequiredPolice then
            local signedIn = not LocalPlayer.state.houseRobSignedIn
            LocalPlayer.state:set("houseRobSignedIn", signedIn, true)

            if signedIn then 
                DGCore.Functions.Notify('Je bent nu aangemeld.', 'success')
            else
                DGCore.Functions.Notify('Je bent niet langer aangemeld.', 'error')
            end
        else
            DGCore.Functions.Notify('Ik neem momenteel niemand aan.', 'error')
        end
    end)
end)

exports("ShowSellItem", function()
    if not currentSellInventory then
        currentSellInventory = DGCore.Functions.TriggerCallback("inventory:server:CreateId", nil, "give")
        TriggerServerEvent("inventory:server:OpenInventory", "give", currentSellInventory)
    else
        DGCore.Functions.Notify('Ik heb nog spullen van je.', 'error')
    end
end)

exports("SellItem", function()
    local itemData = DGCore.Functions.TriggerCallback('inventory:server:GetGiveItem', nil, currentSellInventory)

    if itemData then
        if Config.Sell.Price[itemData.name] then
            local wasCancelled, _ =  exports['dg-misc']:Taskbar("Waarde schatten...", Config.Sell.Time, {
              canCancel = true,
                cancelOnDeath = true,
                disarm = true,
                disableInventory = true,
                controlDisables = {
                    movement = true,
                    carMovement = true,
                    combat = true,
                },
            })
            ClearPedTasks(ped)
            if (wasCancelled) then
              DGCore.Functions.Notify("Geannuleerd...", "error")
              return
            end
            TriggerServerEvent('dg-houserobbery:server:SellItem', itemData)
            DGCore.Functions.Notify("Goed zaken met je te doen.", "success")
        else
            DGCore.Functions.Notify('Je kan dit niet verkopen', 'error')
            TriggerServerEvent('DGCore:Server:AddItem', itemData.name, itemData.amount, nil, itemData.info, itemData.quality)
        end
    else
        DGCore.Functions.Notify('Wat wil je verkopen?', 'error')
    end

    currentSellInventory = nil
end)

function CallCops(houseId)
    if not copsCalled then
        copsCalled = true
        Citizen.SetTimeout(5 * 60 * 1000, function()
            copsCalled = false
        end)

        local ped = PlayerPedId()
        local pos = GetEntityCoords(ped)
        local s1, s2 = GetStreetNameAtCoord(pos.x, pos.y, pos.z)
        local streetLabel = s2 and GetStreetNameFromHashKey(s1)..' '..GetStreetNameFromHashKey(s2) or GetStreetNameFromHashKey(s1)
        TriggerServerEvent("dg-houserobbery:server:CallCops", streetLabel, pos)
    end
end

function GainStress()
	local rng = math.random(100)
	if rng <= Config.GainStressChance then
		TriggerServerEvent('hud:server:GainStress', math.random(3, 5))
	end
end

function CreateEvidence()
	local rng = math.random(100)
	if rng <= Config.FingerdropChance and not true then
		-- HANDSHOES
		TriggerServerEvent("evidence:server:CreateFingerDrop", GetEntityCoords(PlayerPedId()))
	end
end