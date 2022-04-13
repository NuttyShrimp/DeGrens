activePlants = {}
cacheIds = {}

Citizen.CreateThread(function()
    cacheIds.generalPlant = exports["dg-peek"]:addModelEntry(Config.Stages, {
		options = {
			{
				icon = "fas fa-clipboard",
				label = "Check Status",
				action = function(_, entity)
					exports["dg-weed"]:checkStatus(entity)
				end,
				canInteract = function(entity)
					return exports["dg-weed"]:isValidPlant(entity)
				end,
			},
            {
				icon = "fas fa-oil-can",
				label = "Voed",
                items = Config.Food.Item,
				action = function(_, entity)
					exports["dg-weed"]:feedPlant(entity)
				end,
				canInteract = function(entity)
					return exports["dg-weed"]:isValidPlant(entity)
				end,
			},
            {
				icon = "fas fa-axe",
				label = "Maak kapot",
				action = function(_, entity)
					exports["dg-weed"]:destroyPlant(entity)
				end,
				canInteract = function(entity)
					return exports["dg-weed"]:isValidPlant(entity)
				end,
			},
		},
		distance = 2.0,
	})
    cacheIds.cutPlant = exports["dg-peek"]:addModelEntry(Config.Stages[#Config.Stages], {
		options = {
			{
				icon = "fas fa-cut",
				label = "Knip",
				action = function(_, entity)
					exports["dg-weed"]:cutPlant(entity)
				end,
				canInteract = function(entity)
					return exports["dg-weed"]:isValidPlant(entity)
				end,
			},
		},
		distance = 2.0,
	})
end)

-- spawn and despawn plants
Citizen.CreateThread(function()
    while true do
        local ped = PlayerPedId()
        local pos = GetEntityCoords(ped)

        for k, plant in pairs(activePlants) do
            local distance = #(pos - plant.coords)

            if distance < 100 and not plant.object then
                spawnPlantObject(k)
                Citizen.Wait(100)
            elseif distance >= 100 and plant.object then
                despawnPlantObject(k)
                Citizen.Wait(100)   
            end

            Citizen.Wait(10)
        end

        Citizen.Wait(10)
    end
end)