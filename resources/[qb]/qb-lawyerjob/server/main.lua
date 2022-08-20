DGCore.Commands.Add("setlawyer", "Register someone as a lawyer", {{name="id", help="Id of the player"}}, true, function(source, args)
    local Player = DGCore.Functions.GetPlayer(source)
    local playerId = tonumber(args[1])
    local OtherPlayer = DGCore.Functions.GetPlayer(playerId)
    if Player.PlayerData.job.name == "judge" then
        if OtherPlayer ~= nil then 
            local lawyerInfo = {
                id = math.random(100000, 999999),
                firstname = OtherPlayer.PlayerData.charinfo.firstname,
                lastname = OtherPlayer.PlayerData.charinfo.lastname,
                citizenid = OtherPlayer.PlayerData.citizenid,
            }
            OtherPlayer.Functions.SetJob("lawyer", 0)
            -- OtherPlayer.Functions.AddItem("lawyerpass", 1, false, lawyerInfo)
            TriggerClientEvent("DGCore:Notify", source, "You have " .. OtherPlayer.PlayerData.charinfo.firstname .. " " .. OtherPlayer.PlayerData.charinfo.lastname .. " hired as a lawyer")
            TriggerClientEvent("DGCore:Notify", OtherPlayer.PlayerData.source, "You are now a lawyer")
        else
            TriggerClientEvent("DGCore:Notify", source, "Person is present", "error")
        end
    else
        TriggerClientEvent("DGCore:Notify", source, "You are not a judge.", "error")
    end
end)

DGCore.Commands.Add("removelawyer", "Remove someone as a lawyer", {{name="id", help="ID of the player"}}, true, function(source, args)
    local Player = DGCore.Functions.GetPlayer(source)
    local playerId = tonumber(args[1])
    local OtherPlayer = DGCore.Functions.GetPlayer(playerId)
    if Player.PlayerData.job.name == "judge" then
        if OtherPlayer ~= nil then
	    OtherPlayer.Functions.SetJob("unemployed", 0)
            TriggerClientEvent("DGCore:Notify", OtherPlayer.PlayerData.source, "You are now unemployed")
            TriggerClientEvent("DGCore:Notify", source, "You have " .. OtherPlayer.PlayerData.charinfo.firstname .. " " .. OtherPlayer.PlayerData.charinfo.lastname .. "dismiss as a lawyer")
        else
            TriggerClientEvent("DGCore:Notify", source, "Person is not present", "error")
        end
    else
        TriggerClientEvent("DGCore:Notify", source, "Youre not a judge..", "error")
    end
end)

DGX.Inventory.registerUseable("lawyerpass", function(src)
    for k,v in pairs(DGCore.Functions.GetPlayersInRadius(src, 2)) do
        exports['dg-chat']:addMessage(v, {
          prefix = 'Lawyer License: ',
          message = ('<br><br> <strong>Pass-ID:</strong> %s <br><strong>First Name:</strong> %s <br><strong>Last Name:</strong> %s <br><strong>BSN:</strong> %s'):format(data.id, data.firstname, data.lastname, data.citizenid),
          type = 'warning'
        })
    end
end)
