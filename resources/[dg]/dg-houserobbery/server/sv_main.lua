Citizen.CreateThread(function()
    while true do
        Citizen.Wait(Config.MailTime) 

        local selectedHouse = math.random(1, #Config.Houses)
        
        local signedInPlayers = {}
        for _, v in pairs(DGCore.Functions.GetPlayers()) do
            if Player(v).state.houseRobSignedIn then
                signedInPlayers[#signedInPlayers+1] = v
            end
        end
        
        if signedInPlayers and next(signedInPlayers) then
            local choosenPlayer = signedInPlayers[math.random(1, #signedInPlayers)]
            TriggerClientEvent('dg-phone:client:addNewMail', choosenPlayer, "Huisinbraak", "Bert B.", "Je bent geselecteerd voor de job. De locatie staat op je GPS gemarkeerd.")
            TriggerClientEvent('dg-houserobbery:client:SetHouseLocation', choosenPlayer, selectedHouse)
        end
    end
end)