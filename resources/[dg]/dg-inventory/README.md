## Installation
- Import `dg-inventory.sql` in your database

## Shared
- Use exports["dg-inventory"]:GetItemData()[itemname]
- Can also get weapons using their hashkey instead of name
- Do not call on resource start, needs to be pulled from db

## Open inventory
- Open a stash or shop using the "inventory:server:OpenInventory" event
- Params: Inventorytype (shop, stash), inventoryid, data as object with label items
- When opening stash also trigger "inventory:client:SetCurrentStash" with the stashname

## Give inventory
- Open temporary inventory to be used in other scripts
- Open using event "inventory:server:OpenInventory" with params "give" and an ID that laters needs to be used to get the items in the tempinv
- Add handler to event "inventory:client:ClosedGiveInventory", event gets triggered when tempinv gets closed, now u can get items inside with the id u used to open it
- The close event provides all the tempinvs, use like: tempinvs[theidyouused].items[1]

## Required items
- Show using event "inventory:client:requiredItems" with the items and a bool
- Provide items as list with object which has name and image

## Itembox
- Show using event "inventory:client:ItemBox" with the itemdata and "remove" or "add" 
- Itemdata get from the export