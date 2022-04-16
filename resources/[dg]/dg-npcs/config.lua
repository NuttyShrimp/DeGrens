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
        id = "weapon_customizer",
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
	    flag = {name = "isWeaponCustomizer", active = true},
        animation = nil,
	    scenario = "WORLD_HUMAN_GUARD_STAND_CASINO"
    },
    {
        id = "houserobbery_signin",
	    model = "g_m_y_famfor_01",
	    position = vector4(-897.35, -1145.86, 6.02, 77.46),
	    --appearance = "",
	    networked = false,
	    distance = 25.0,
	    settings = {
		    {setting = "invincible", active = true},
		    {setting = "ignore", active = true},
		    {setting = "freeze", active = true},
		    {setting = "collision", active = true},
	    },
	    flag = {name = "isHouseRobSignin", active = true},
        animation = nil,
	    scenario = "WORLD_HUMAN_STAND_IMPATIENT"
    },
    {
        id = "houserobbery_sell",
	    model = "mp_m_exarmy_01",
	    position = vector4(1538.55, 1704.01, 109.66, 104.21),
	    --appearance = "",
	    networked = false,
	    distance = 25.0,
	    settings = {
		    {setting = "invincible", active = true},
		    {setting = "ignore", active = true},
		    {setting = "freeze", active = true},
		    {setting = "collision", active = true},
	    },
	    flag = {name = "isHouseRobSell", active = true},
        animation = nil,
	    scenario = "WORLD_HUMAN_STAND_IMPATIENT"
    }
}