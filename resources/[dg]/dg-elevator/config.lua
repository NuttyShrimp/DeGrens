Config = {}

Config.Elevators = {
    ["humanelabs"] = {
        name = "Humane Labs",
        levels = {
            ["labo"] = {
                id = "labo",
                name = "Labo's",
                interact = vector3(3541.95, 3673.85, 28.23),
                spawn = vector4(3540.74, 3675.59, 28.11, 172.5),
            },
            ["basement"] = {
                id = "basement",
                name = "Kelder",
                interact = vector3(3541.95, 3673.85, 21.12),
                spawn = vector4(3540.68, 3675.67, 20.99, 171.95),
            },
        }
    },
    ["arcadius"] = {
        name = "Arcadius Building Lift",
        levels = {
            ["office"] = {
                name = "Bureau",
                interact = vector3(-141.66, -621.83, 168.99),
                spawn = vector4(-141.5, -620.98, 168.82, 282.13),
            },
            ["garage"] = {
                name = "Garage",
                interact = vector3(-198.97, -581.77, 136.21),
                spawn = vector4(-198.48, -580.77, 135.99, 271.83)
            },
            ["customs"] = {
                name = "Tuning Shop",
                interact = vector3(-140.15, -586.24, 167.18),
                spawn = vector4(-138.87, -588.26, 167.0, 131.3),
                job = "police",
            },
        }
    }
}