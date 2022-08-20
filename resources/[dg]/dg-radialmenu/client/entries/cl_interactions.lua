entries.interactions = {
	{
		id = 'handcuff',
		title = 'Cuff',
		icon = 'user-lock',
		event = 'police:client:CuffPlayerSoft',
		shouldClose = true,
		isEnabled = function()
			return DGX.Inventory.doesPlayerHaveItems('handcuffs')
		end
	}, {
		id = 'playerinvehicle',
		title = 'Put In Vehicle',
		icon = 'car-side',
		event = 'police:client:PutPlayerInVehicle',
		shouldClose = true,
		isEnabled = function()
			-- TODO: check if near vehicle
			return true
		end
	}, {
		id = 'playeroutvehicle',
		title = 'Take Out Of Vehicle',
		icon = 'car-side',
		event = 'police:client:SetPlayerOutVehicle',
		shouldClose = true,
		isEnabled = function()
			-- TODO: check if near vehicle
			return true
		end
	}, {
		id = 'stealplayer',
		title = 'Rob',
		icon = 'mask',
		event = 'police:client:RobPlayer',
		shouldClose = true,
		isEnabled = function()
			-- TODO: check if near another player
			return true
		end
	}, {
		id = 'escort',
		title = 'Kidnap',
		icon = 'user-friends',
		event = 'police:client:KidnapPlayer',
		shouldClose = true,
		isEnabled = function()
			-- TODO: check if near another player
			return true
		end
	}, {
		id = 'escort2',
		title = 'Escort',
		icon = 'user-friends',
		event = 'police:client:EscortPlayer',
		shouldClose = true,
		isEnabled = function()
			-- TODO: check if near another player
			return true
		end
	}, {
		id = 'escort554',
		title = 'Hostage',
		icon = 'child',
		event = 'A5:Client:TakeHostage',
		shouldClose = true,
		isEnabled = function()
			-- TODO: check if near another player
			return true
		end
	}
}