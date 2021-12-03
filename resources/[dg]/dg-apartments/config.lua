Config = {}

Config.Locations = {
	{
		name = "alta_street",
		label = "Alta Street",
		mlo = "gabz_apartment_room",
		enter = {
			center = vector3(-271.21, -958.01, 31.22),
			width = 1.2,
			length = 2.8,
			options = {
				heading = 27,
				minZ = 30.22,
				maxZ = 34.22
			}
		},
		exit = vector4(-268.83, -962.34, 31.23, 295.95),
		interactions = {
			{
				offset = vector3(-4.03, -3.62, 0.78),
				dist = 2.0,
				type = "leave",
				zone = "poly",
				GeneralUse = {
					label = "Exit",
					isServer = true,
					event = "dg-apartments:server:leaveApartment"
				},
				housingMain = {
					label = "Invite",
					event = "dg-apartment:inviteMenu"
				}
			},
			{
				offset = vector3(-0.1, 2.52, 1),
				dist = 1,
				type = "outfit",
				zone = "poly",
				GeneralUse = {
          label = "Change Outfit",
          event = "qb-clothing:client:openOutfitMenu"
        }
			},
			{
				dist = 1.5,
				type = "bed",
				zone = "peek",
				model = `gabz_pinkcage_bed`,
				options = {
					{
						type = "server",
						event = "qb-houses:server:LogoutLocation",
						icon = "fas fa-sign-out-alt",
						label = "Logout",
					},
				}
			},
			{
				dist = 1.5,
				type = "stash",
				zone = "peek",
				model = `v_res_tre_storagebox`,
				options = {
					{
						type = "client",
						event = "dg-apartment:openStash",
						icon = "fas fa-box",
						label = "Open stash",
					},
				}
			},
		}
	}
}

Config.ErrorCodes = {
	already_owns_ap = "Je bezit al een apartment"
}