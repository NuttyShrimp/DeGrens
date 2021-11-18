Config = Config or {}

local currentPedFlag = 1;

Config.PrevPedFlag = function()
    currentPedFlag = currentPedFlag * 2;
	return currentPedFlag / 2;
end

-- add flags here always same config.prevpedflag!
Config.PEDFLAGS = {
	["isBanker"] = Config.PrevPedFlag(),
}

-- add npcs to the list here
Config.NPCS = {
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
    }
}


