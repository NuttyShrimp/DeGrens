# Doorlock
Copied and refactored from original 1.0 doorlock script

## Add Doors

``` json
"UNIQUE_ID_VAN_6_CIJFERS": {
    "description": "Tekst voor het overzichtelijk te houden",
    "locked": true,
    "authorized": [
        "police",
        "ambulance"
    ],
    "lockpickable": true, // optional entry, set to true if you want to be able to open with lockpick
    "thermiteable": { // optional entry, set to true if you want to be able to open with thermite
        "grid": 0, // gridsize for thermitehack
        "amount": 0, // amount for thermitehack
        "ped": { // position for thermite
            "x": 0.0,
            "y": 0.0,
            "heading": 0.0
        }
    },
    "distance": 3.0, // optional entry, if you dont add this then distance will be 2.0
    "noInteraction": true, // optional entry, set to true if you dont want the interaction to appear
    "noAnimation": true, // optional entry, set to true if you dont want an animation
    "playSound": true, // optional entry, set to true if you want a blipblip
    "doors": [
        {
            "object": "object_name",
            "coords": {
                "x": 0,
                "y": 0,
                "z": 0
            }
        },
        // Moest het een dubbele deur zijn dan zo
        // {
        //     "object": "ander_object_name",
        //     "coords": {
        //         "x": 0,
        //         "y": 0,
        //         "z": 0
        //     }
        // }
    ],
    "polyzone": { // optional entry if you want to open the door while in polyzone instead of aiming at it
        "center": {
            "x": 0.0,
            "y": 0.0,
            "z": 0.0
        },
        "width": 0.0,
        "length": 0.0,
        "options": {
            "heading": 0.0,
            "minZ": 0.0,
            "maxZ": 0.0
        }
    }
}
```

## Toggle doors from other scripts

``` lua
TriggerServerEvent("dg-doorlock:server:changeDoorLockState", id, state)
```
