# Inventory

## Itemdata

```lua 
local itemName = "lockpick" -- can also be hash when dealing with weapons
exports["dg-inventory"]:GetItemData(itemName) 
```

## Open Inventory
### Shop
``` lua
local shopId = "hospital" -- unique name for saving stock
local data =  {
    label = "Winkel Displayname",
    slots = 1,
    items = {
        [1] = {
            name = "radio",
            price = 0,
            amount = 50,
            info = {},
            type = "item",
            slot = 1,
        },
    }
}
TriggerServerEvent("inventory:server:OpenInventory", "shop", shopId, data)
```

### Stash
``` lua
local stashId = "mechanicstash"
local data = {
    maxweight = 10000,
    slots = 10,
}
TriggerServerEvent("inventory:server:OpenInventory", "stash", stashId, data)
```

### Give
``` lua
local id = "saveThisToBeUsedLater" -- save this ;)
TriggerServerEvent("inventory:server:OpenInventory", "give", id)

RegisterNetEvent("inventory:client:ClosedGiveInventory", function(data)
    local givenItem = data[id].items[1]
end)
```

### Otherplayer
``` lua
TriggerServerEvent("inventory:server:OpenInventory", "otherplayer", playerId)
```

## Required items
``` lua
local items = {
    "itemnamehere",
    "otheritemnamehere",
}
local showRequiredItems = true

TriggerClientEvent("inventory:client:requiredItems", items, showRequiredItems)
```

## Itembox
``` lua
local itemName = "lockpick"
local action = "add" -- "remove"
TriggerClientEvent("inventory:client:ItemBox", itemName, action)
```