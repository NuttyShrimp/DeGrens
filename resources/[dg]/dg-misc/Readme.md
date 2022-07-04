# DeGrens Miscellaneous scripts

the difference between this resource and `dg-lib` is that this resources has
script that need certain libraries from dg-lib to function. This will also be usable
via exports instead of adding the file to the script. There will be libs and wrappers
for some script in `dg-lib` and `ts-shared`

## TaskBar

Interface for settings table:

```typescript
interface TaskBarSettings {
  canCancel?: boolean;
  cancelOnDeath?: boolean;
  cancelOnMove?: boolean;
  disarm?: boolean;
  disableInventory?: boolean;
  controlDisables?: {
    movement?: boolean;
    carMovement?: boolean;
    mouse?: boolean;
    combat?: boolean;
  };
  animation?: {
    animDict?: string;
    anim?: string;
    flags?: number;
    task?: string;
  };
  prop?: {
    model?: nil;
    bone?: nil;
    coords?: { x: number, y: number, z: number };
    rotation?: { x: number, y: number, z: number };
  };
}
```

## Random Blackmoney Sale
```lua
exports['dg-misc']:randomSellBlackMoney(source)
```

Use this serversided export to sell blackmoney from an other script.  
For example in a legal delivery job, put a random chance on triggering the export to sometimes sell blackmoney 
