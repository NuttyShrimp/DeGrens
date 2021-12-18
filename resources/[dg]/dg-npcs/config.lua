NPCS = {
    {
        id = "paycheck_banker",
	    model = "cs_bankman",
	    position = vector4(242.02, 227.11, 106.0, 155.5),
	    --appearance = "",
	    networked = false,
	    distance = 25.0,
	    settings = {
		    {setting = "invincible", active = true},
		    {setting = "ignore", active = true},
		    {setting = "freeze", active = true},
		    {setting = "collision", active = true},
	    },
	    flag = {name = "isBanker", active = true},
        animation = nil,
	    scenario = "PROP_HUMAN_SEAT_CHAIR_UPRIGHT"
    },
    {
        id = "weapon_repair",
	    model = "mp_m_exarmy_01",
	    position = vector4(-172.69, -756.91, 44.23, 249.1),
	    --appearance = "",
	    networked = false,
	    distance = 25.0,
	    settings = {
		    {setting = "invincible", active = true},
		    {setting = "ignore", active = true},
		    {setting = "freeze", active = true},
		    {setting = "collision", active = true},
	    },
	    flag = {name = "isWeaponRepair", active = true},
        animation = nil,
	    scenario = "WORLD_HUMAN_GUARD_STAND_CASINO"
    }
}