insideHouse = nil
inExit = false
houseObjects = nil
copsCalled = false
selectedForHouse = 0

currentSellInventory = nil

cacheIds = {
    signPed = nil,
    sellPed = nil,
    door = nil,
    loot = {},
}

-- setup zones, peekoptions and get data
Citizen.CreateThread(function()
    local allHouseData = DGCore.Functions.TriggerCallback('dg-houserobbery:server:GetAllHouseData')
    for k, v in pairs(allHouseData) do
        Config.Houses[k].data = v
    end

    -- peek for sign ped
    cacheIds.signPed = exports["dg-peek"]:addFlagEntry("isHouseRobSignin", {
        options = {
            {
                icon = "fas fa-pen",
                label = "Meld aan/uit",
                action = function()
                    exports['dg-houserobbery']:SignInOut()
                end,
            },
        },
        distance = 1
    }) 

    -- peek for sell ped
    cacheIds.sellPed = exports["dg-peek"]:addFlagEntry("isHouseRobSell", {
        options = {
            {
                icon = "fas fa-box",
                label = "Toon voorwerp",
                action = function()
                    exports['dg-houserobbery']:ShowSellItem()
                end,
            },
            {
                icon = "fas fa-money-bill",
                label = "Verkoop voorwerp",
                action = function()
                    exports['dg-houserobbery']:SellItem()
                end,
            },
        },
        distance = 1
    })

    -- add zones at door
    for index, house in pairs(Config.Houses) do
        exports['dg-polytarget']:AddBoxZone("houserobbery_door", house.coords, 1.0, 1.0, {
            heading = house.heading,
            minZ = house.coords.z - 2,
            maxZ = house.coords.z + 2,
            data = {
                houseId = index,
            }
        })
	end

    -- add peek for door
    cacheIds.door = exports['dg-peek']:addZoneEntry("houserobbery_door", {
        options = {
            {
                icon = "fas fa-lock-open",
                label = "Forceer deur",
                action = function(entry)
                    exports['dg-houserobbery']:UnlockDoor(entry.data.houseId)
                end,
                canInteract = function(entity, distance, entry)
                    return exports['dg-houserobbery']:CanUnlockDoor(entry.data.houseId)
                end,
            },
            {
                icon = "fas fa-door-open",
                label = "Ga binnen",
                action = function(entry)
                    exports['dg-houserobbery']:EnterHouse(entry.data.houseId)
                end,
                canInteract = function(entity, distance, entry)
                    return exports['dg-houserobbery']:IsDoorUnlocked(entry.data.houseId)
                end,
            },
            {
                icon = "fas fa-lock",
                label = "Vergrendel deur",
                action = function(entry)
                    exports['dg-houserobbery']:LockDoor(entry.data.houseId)
                end,
                canInteract = function(entity, distance, entry)
                    return exports['dg-houserobbery']:IsDoorUnlocked(entry.data.houseId)
                end,
                job = "police"
            },
        },
        distance = 1.5
    })
end)

