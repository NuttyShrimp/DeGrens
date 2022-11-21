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

## Particles
Using this wrapper you can create networked particle effects. Created particles can only be removed by the same player
- Bone targets cannot be peds!

```ts
  type Target = { coords: Vec3 } | { netId: number } | { netId: number; boneName: string };

  type Particle = {
    dict: string;
    name: string;
    offset?: Vec3;
    rotation?: Vec3;
    scale?: number;
    looped: boolean;
  } & Target;
```

### Client Exports
- addParticle: (particle: Particle) -> returns id: string
- removeParticle: (id: string)

## Elevators
Using this module you can create ingame elevators with seperate business, gang and job whitelisting.
- Config can be found in dg-config/configs/elevators.json
```json
  "arcadius-elevator": {
    "name": "Arcadius Building Lift",
    "levels": {
      "tuning-shop": {
        "name": "Tuning Shop",
        "interact": { "x": -140.15, "y": -586.24, "z": 167.18 },
        "spawn": { "x": -138.87, "y": -588.26, "z": 167.0, "w": 131.3 },
        // These options are optional!
        "job": [
          {"name": "police", "rank": 2}, 
          {"name": "ambulance"}
        ],
        "business": [
          {"name": "dff", "permissions": ["property_access"]}
          {"name": "pdm"}
        ],
        "gang": ["esb", "vagos"]
      },
      "other-level": {
        // ...
      }
    }
  }
```

## Status
Adding new status type:
- Add config to dg-config/config/playerstatuses.json
- Add type to ts-shared/typescript/src/shared/types/util.d.ts
## Reputations
Adding new reputation type:
- Add type name to ts-shared/typescript/src/shared/types/util.d.ts
- Add column to table `character_reputations` (IMPORTANT: default value 0)

