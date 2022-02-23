AddEventHandler('onResourceStop', function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end

    exports['dg-peek']:removeFlagEntry(cacheIds.signPed)
    exports['dg-peek']:removeFlagEntry(cacheIds.sellPed)
    exports['dg-peek']:removeZoneEntry(cacheIds.door)

    for i = 1, #Config.Houses do
        exports['dg-polytarget']:removeZone("houserobbery_door")
    end

end)

RegisterNetEvent('police:SetCopCount', function(amount)
    if amount >= Config.RequiredPolice then
        if exports['dg-npcs']:GetNpc('houserobbery_signin').disabled then
            exports['dg-npcs']:EnableNpc("houserobbery_signin")
        end
    else
        if not exports['dg-npcs']:GetNpc('houserobbery_signin').disabled then
            exports['dg-npcs']:DisableNpc("houserobbery_signin")
        end
        if LocalPlayer.state.houseRobSignedIn then
            LocalPlayer.state:set("houseRobSignedIn", false, true)
        end
    end
end)

RegisterNetEvent('dg-houserobbery:client:UpdateHouseData', function(houseId, data)
    Config.Houses[houseId].data = data
end)

RegisterNetEvent("dg-polyzone:enter", function(name, data)
    if name == "houserobbery_exit" then
        inExit = true
        local generalUseKey = exports["dg-lib"]:GetCurrentKeyMap("+GeneralUse")
        exports['dg-lib']:showInteraction(generalUseKey..' - Ga buiten', 'info')
    end
end)

RegisterNetEvent("dg-polyzone:exit", function(name)
    if name == "houserobbery_exit" then
        inExit = false
        exports['dg-lib']:hideInteraction()
    end
end)

RegisterNetEvent('dg-lib:keyEvent')
AddEventHandler('dg-lib:keyEvent', function(name, isDown)
    if not isDown then return end
	if name == "GeneralUse" then
		if insideHouse and inExit then
            LeaveHouse()
		end
	end
end)

RegisterNetEvent('dg-houserobbery:client:SetHouseLocation', function(houseId)
    selectedForHouse = houseId

    local coords = Config.Houses[houseId].coords
    local transG = 150
    local blip = AddBlipForRadius(coords.x, coords.y, coords.z, 100.0)
    SetBlipColour(blip, 1)
    SetBlipAlpha(blip, transG)
    SetBlipHighDetail(blip, true)

    while transG ~= 0 do
        Citizen.Wait(1000 * 8)
        transG = transG - 1
        SetBlipAlpha(blip, transG)
        if transG == 0 then
            SetBlipSprite(blip, 2)
            RemoveBlip(blip)
            selectedForHouse = 0
            break
        end
    end
end)

RegisterNetEvent("dg-houserobbery:client:PoliceAlert", function(streetLabel, coords)
    PlaySound(-1, "Lose_1st", "GTAO_FM_Events_Soundset", 0, 0, 1)
    TriggerEvent('dg-policealerts:client:AddPoliceAlert', {
        timeOut = 5000,
        alertTitle = "Poging Huisinbraak",
        coords = {x = coords.x, y = coords.y, z = coords.z},
        details = {
            [1] = {icon = '<i class="fas fa-globe-europe"></i>', detail = streetLabel}
        },
        callSign = DGCore.Functions.GetPlayerData().metadata["callsign"]
    })

    local transG = 250
    local blip = AddBlipForCoord(coords.x, coords.y, coords.z)
    SetBlipSprite(blip, 458)
    SetBlipColour(blip, 1)
    SetBlipDisplay(blip, 4)
    SetBlipAlpha(blip, transG)
    SetBlipScale(blip, 1.0)
    BeginTextCommandSetBlipName('STRING')
    AddTextComponentString("Poging Huisinbraak")
    EndTextCommandSetBlipName(blip)

    while transG ~= 0 do
        Wait(180 * 4)
        transG = transG - 1
        SetBlipAlpha(blip, transG)
        if transG == 0 then
            SetBlipSprite(blip, 2)
            RemoveBlip(blip)
            return
        end
    end
end)