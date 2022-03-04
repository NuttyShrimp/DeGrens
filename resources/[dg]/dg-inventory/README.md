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

## Adding items

```typescript
interface Data {
    // Internal name
    name: string; 
    // Show name
    label: string; 
    // Weight in grams
    weight: number; 
    // Type
    type: 'item' | 'weapon';
    // Provide ammotype when type is 'weapon'
    ammotype?: string; 
    // Can stack item
    stackable: boolean;
    // Can use item
    useable: boolean;
    // Determines if inventory should close on use, only when useable is true
    shouldClose?: boolean; 
    // JSON representation of combining recipe when wanted
    combinable?: string; 
    // If item needs to expire, provide amount of minutes item lasts
    decayrate?: number; 
    // Image name
    image: string; 
    // Description
    description: string; 
    // True if you need to visually hold item, more info in dg-propattach
    hold?: boolean 
}
```
