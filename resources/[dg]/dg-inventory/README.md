# Inventory

- All exports can be used with Inventory module of DGX

## Items
- Itemdata can be found in dg-config/configs/inventory/items.json
- Use this template to add new items:
  ```json
  {
    "name": "item_name", // Unique itemname - (pls seperate every word with _ for uniformity)
    "label": "Item Name", // Display name of item - (pls keep relevant to item name)
    "image": "item_image.png", // File to use for item (place images in dg-ui/[src]/src/assets/inventory) - (pls keep itemname same or relevant to item name)
    "size": {"x": 1, "y": 1}, // Itemsize in inventory
    "decayRate": 60, // Amount of minutes before item breaks - OPTIONAL
    "description": "item-description", // Item description - OPTIONAL
    "useable": true, // Whether or not item can be used - OPTIONAL default: false
    "closeOnUse": false, // Whether or not inventory should close when used - OPTIONAL default: true
    "markedForSeizure": true, // Whether or not item is marked for seizure - OPTIONAL default: false
  }
  ```
- OnCreate metadata can be found in typescript/src/server/modules/items/helpers.items.ts
- Item objects and container whitelist can be found in dg-config/configs/inventory/config.json


## Client
### Exports
| Name                 | Parameters                          | Returns                                            |
| -------------------- | ----------------------------------- | -------------------------------------------------- |
| getItemData          | `itemName: string`                  | ItemData object                                    |
| getAllItemData       | /                                   | ItemData object array                              |
| hasObject            | /                                   | boolean whether player has primary holdable object |
| openStash            | `stashId: string`, `size?: number`  | /                                                  |
| openOtherPlayer      | `plyId: number`                     | /                                                  |
| openShop             | `shopId: string`                    | /                                                  |
| doesPlayerHaveItems  | `itemNames: string or string[]`     | boolean                                            |
| removeItemFromPlayer | `itemName: string`                  | /                                                  |
| toggleObject         | `itemId: string`, `toggle: boolean` | /                                                  |
| isOpen               | /                                   | boolean                                            |

## Server
### Exports
| Name                       | Parameters                                                                                                             | Returns                                                  |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| registerUseable            | `items: string or string[]`, `handler: Inventory.UsageHandler`                                                         | /                                                        |
| onInventoryUpdate          | `type: Inventory.Type`, `handler: Inventory.UpdateHandlerData['handler]`, `item: string`, `action: 'add' or 'remove' ` | /                                                        |
| getAllItemData             | /                                                                                                                      | Promise<Record<string, Inventory.ItemData>>              |
| getItemData                | `itemName: string`                                                                                                     | Inventory.ItemData                          or undefined |
| hasObject                  | `plyId: number`                                                                                                        | boolean, whether player has holdable obj                 |
| giveStarterItems           | `plyId: number`                                                                                                        | /                                                        |
| clearPlayerInventory       | `plyId: number`                                                                                                        | /                                                        |
| addItemToPlayer            | `plyId: number`, `itemName: string`, `amount: number`, `metadata?: object`                                             | /                                                        |
| doesPlayerHaveItems        | `plyId: number`, `itemName: string or string[]`                                                                        | Promise<boolean>                                         |
| removeItemFromPlayer       | `plyId: number`, `itemName: string `                                                                                   | Promise<boolean>, boolean shows succes                   |
| getAmountPlayerHas         | `plyId: number`, `itemName: string`                                                                                    | Promise<number>, amount of item                          |
| getItemStateById           | `itemId: string`                                                                                                       | Inventory.ItemData or undefined                          |
| setMetadataOfItem          | `itemId: string`, `cb: (old) => new`                                                                                   | /                                                        |
| setQualityOfitem           | `itemId: string`, `cb: (old) => new`                                                                                   | /                                                        |
| moveItemToInventory        | `type: Inventory.Type`, `identifier: string`, `itemId: string`,                                                        | /                                                        |
| getItemsInInventory        | `type: Inventory.Type`, `identifier: string`                                                                           | Promise<Inventory.ItemState[]>                           |
| getItemsForNameInInventory | `type: Inventory.Type`, `identifier: string`, `name: string`                                                           | Promise<Inventory.ItemState[]>                           |
| getFirstItemOfName         | `type: Inventory.Type`, `identifier: string`, `itemName: string`                                                       | Promise<Inventory.ItemState or undefined>                |
| destroyItem                | `itemId: string`                                                                                                       | /                                                        |
| createScriptedStash        | `identifier: string`, `size: number`, `allowedItems?: string[]`                                                        | /                                                        |