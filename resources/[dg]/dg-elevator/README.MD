# Elevators

Om meerdere toe te voegen volg deze template:

``` lua
["index"] = { -- Interne naam van de lift, MOET uniek zijn
    name = "Arcadius Building Lift", -- Display naam van lift, wordt getoond in menu
    levels = {
        ["levelindex"] = { -- Interne naam van de verdieping, MOET uniek zijn
            name = "Bureau", -- Display naam van verdieping, wordt getoond in menu
            interact = vector3(0, 0, 0), -- Positie van de liftknop waar je moet interacten. Deze coordinaat is middelpunt van de peekable bol.
            spawn = vector4(0, 0, 0, 0), -- Positie van de spawnplaats na het gebruiken van de lift. Vector4 voor de heading niet vergeten!
            job = "police", -- De vereiste job die nodig is om deze optie te kunnen zien. Indien voor iedereen dan deze lijn weglaten.
        },
        [] = { -- Zo kan je meerdere levels adden
            ...
        },
    },
},
```
