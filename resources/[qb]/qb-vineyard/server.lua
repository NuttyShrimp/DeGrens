RegisterNetEvent('qb-vineyard:server:getGrapes')
AddEventHandler('qb-vineyard:server:getGrapes', function()
    local Player = DGCore.Functions.GetPlayer(source)

    -- Player.Functions.AddItem("grape", Config.GrapeAmount)
end)

RegisterServerEvent('qb-vineyard:server:loadIngredients') 
AddEventHandler('qb-vineyard:server:loadIngredients', function()
	local xPlayer = DGCore.Functions.GetPlayer(tonumber(source))
    local grape = xPlayer.Functions.GetItemByName('grape')

	if xPlayer.PlayerData.items ~= nil then 
        if grape ~= nil then 
            if grape.amount >= 23 then 

                xPlayer.Functions.RemoveItem("grape", 23, false)
                
                TriggerClientEvent("qb-vineyard:client:loadIngredients", source)

            else
                TriggerClientEvent('DGCore:Notify', source, "You do not have the correct items", 'error')   
            end
        else
            TriggerClientEvent('DGCore:Notify', source, "You do not have the correct items", 'error')   
        end
	else
		TriggerClientEvent('DGCore:Notify', source, "You Have Nothing...", "error")
	end 
	
end) 

RegisterServerEvent('qb-vineyard:server:grapeJuice') 
AddEventHandler('qb-vineyard:server:grapeJuice', function()
	local xPlayer = DGCore.Functions.GetPlayer(tonumber(source))
    local grape = xPlayer.Functions.GetItemByName('grape')

	if xPlayer.PlayerData.items ~= nil then 
        if grape ~= nil then 
            if grape.amount >= 16 then 

                xPlayer.Functions.RemoveItem("grape", 16, false)
                
                TriggerClientEvent("qb-vineyard:client:grapeJuice", source)

            else
                TriggerClientEvent('DGCore:Notify', source, "You do not have the correct items", 'error')   
            end
        else
            TriggerClientEvent('DGCore:Notify', source, "You do not have the correct items", 'error')   
        end
	else
		TriggerClientEvent('DGCore:Notify', source, "You Have Nothing...", "error")
	end 
	
end) 

RegisterServerEvent('qb-vineyard:server:receiveWine')
AddEventHandler('qb-vineyard:server:receiveWine', function()
	local xPlayer = DGCore.Functions.GetPlayer(tonumber(source))

	-- xPlayer.Functions.AddItem("wine", Config.WineAmount, false)
end)

RegisterServerEvent('qb-vineyard:server:receiveGrapeJuice')
AddEventHandler('qb-vineyard:server:receiveGrapeJuice', function()
	local xPlayer = DGCore.Functions.GetPlayer(tonumber(source))

	-- xPlayer.Functions.AddItem("grapejuice", Config.GrapeJuiceAmount, false)
end)


-- Hire/Fire

--[[ DGCore.Commands.Add("hirevineyard", "Hire a player to the Vineyard!", {{name="id", help="Player ID"}}, true, function(source, args)
    local Player = DGCore.Functions.GetPlayer(tonumber(args[1]))
    local Myself = DGCore.Functions.GetPlayer(source)
    if Player ~= nil then 
        if (Myself.PlayerData.gang.name == "la_familia") then
            Player.Functions.SetJob("vineyard")
        end
    end
end)

DGCore.Commands.Add("firevineyard", "Fire a player to the Vineyard!", {{name="id", help="Player ID"}}, true, function(source, args)
    local Player = DGCore.Functions.GetPlayer(tonumber(args[1]))
    local Myself = DGCore.Functions.GetPlayer(source)
    if Player ~= nil then 
        if (Myself.PlayerData.gang.name == "la_familia") then
            Player.Functions.SetJob("unemployed")
        end
    end
end) ]]