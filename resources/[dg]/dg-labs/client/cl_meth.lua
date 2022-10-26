local currentSettingsId = nil
local hasPackage = false

addMethPeekEntries = function()
    cacheIds[#cacheIds + 1] = exports['dg-peek']:addZoneEntry("drugslab_action", {
        options = {
            {
                icon = "fas fa-power-off",
                label = "Zet aan",
                action = function()
                    exports['dg-labs']:startMeth()
                end,
                canInteract = function(_, _, entry)
                    return entry.data.action == "start"
                end
            }, 
            {
                icon = "fas fa-wrench",
                label = "Instellen",
                action = function(entry)
                    local settingsId = tonumber(DGCore.Shared.SplitStr(entry.data.action, '_')[2])
                    exports['dg-labs']:setMethSettings(settingsId)
                end,
                canInteract = function(_, _, entry)
                    return DGCore.Shared.SplitStr(entry.data.action, '_')[1] == "station"
                end
            }, 
            {
                icon = "fas fa-box",
                label = "Vul",
                action = function(entry)
                    local statusId = tonumber(DGCore.Shared.SplitStr(entry.data.action, '_')[2])
                    exports['dg-labs']:increaseMethStatus(statusId)
                end,
                canInteract = function(_, _, entry)
                    return DGCore.Shared.SplitStr(entry.data.action, '_')[1] == "station" and exports["dg-labs"]:hasMethPackage()
                end
            }, 
            {
                icon = "fas fa-box",
                label = "Neem",
                action = function()
                    exports['dg-labs']:takeMethPackage()
                end,
                canInteract = function(_, _, entry)
                    return DGCore.Shared.SplitStr(entry.data.action, '_')[1] == "package" and not exports["dg-labs"]:hasMethPackage()
                end
            },
            {
                icon = "fas fa-box",
                label = "Leg weg",
                action = function()
                    exports['dg-labs']:removeMethPackage()
                end,
                canInteract = function(_, _, entry)
                    return DGCore.Shared.SplitStr(entry.data.action, '_')[1] == "package" and exports["dg-labs"]:hasMethPackage()
                end
            },
            {
                icon = "fas fa-capsules",
                label = "Verzamel",
                action = function()
                    exports['dg-labs']:collectMeth()
                end,
                canInteract = function(_, _, entry)
                    return DGCore.Shared.SplitStr(entry.data.action, '_')[1] == "take"
                end
            }
        },
        distance = 1.5
    })
end

exports("startMeth", function()
    local started = DGCore.Functions.TriggerCallback("dg-labs:server:meth:GetStartState", currentLabId)
    if started then
        exports['dg-ui']:addNotification("Dit staat al aan...", "error")
        return
    end

    local enoughPlayers = DGCore.Functions.TriggerCallback("dg-labs:server:enoughPlayers", "meth")
    if not enoughPlayers then 
        exports['dg-ui']:addNotification("Dit werkt momenteel niet...", "error")
        return
    end

    DGCore.Functions.Progressbar("start_meth", "Aanzetten..", 8000, false, true, {
        disableMovement = true,
        disableCarMovement = true,
        disableMouse = false,
        disableCombat = true
    }, {
        animDict = "anim@heists@prison_heiststation@cop_reactions",
        anim = "cop_b_idle",
        flags = 16
    }, {}, {}, function() -- Done
        StopAnimTask(PlayerPedId(), "anim@heists@prison_heiststation@cop_reactions", "cop_b_idle", 1.0)
        local config = DGCore.Functions.TriggerCallback('dg-labs:server:getConfig')
        exports["dg-numbergame"]:OpenGame(function(success)
            if success then
                TriggerServerEvent("dg-labs:server:meth:SetStartState", currentLabId)
                exports['dg-ui']:addNotification("Systeem aangezet", "success")
            else
                exports['dg-ui']:addNotification("Aanzetten mislukt...", "error")
            end
        end, config.meth.hack.size, config.meth.hack.time)
        DGX.Events.emitNet('hud:server:GainStress', math.random(5, 15)/10)
    end, function() -- Cancel
        StopAnimTask(PlayerPedId(), "anim@heists@prison_heiststation@cop_reactions", "cop_b_idle", 1.0)
        exports['dg-ui']:addNotification("Geannuleerd..", "error")
    end)
end)

exports("setMethSettings", function(settingsId)
    if currentSettingsId then
        exports['dg-ui']:addNotification("Je bent nog bezig met ingeven", "error")
        return
    end

    local started = DGCore.Functions.TriggerCallback("dg-labs:server:meth:GetStartState", currentLabId)
    if not started then
        exports['dg-ui']:addNotification("Dit staat nog niet aan...", "error")
        return
    end

    if hasPackage then
        exports['dg-ui']:addNotification("Je hebt je hangen vol...", "error")
        return
    end

    DGCore.Functions.Progressbar("meth_settings", "Instellen...", 10000, false, true, {
        disableMovement = true,
        disableCarMovement = true,
        disableMouse = false,
        disableCombat = true
    }, {
        animDict = "anim@amb@business@meth@meth_monitoring_cooking@monitoring@",
        anim = "button_press_monitor",
        flags = 16
    }, {}, {}, function() -- Done
        StopAnimTask(PlayerPedId(), "anim@amb@business@meth@meth_monitoring_cooking@monitoring@", "button_press_monitor", 1.0)

        currentSettingsId = settingsId
        local settings = DGCore.Functions.TriggerCallback("dg-labs:server:meth:GetSettings", currentLabId, settingsId)
        openApplication("sliders", settings)

        DGX.Events.emitNet('hud:server:GainStress', math.random(1, 5)/10)
    end, function()
        StopAnimTask(PlayerPedId(), "anim@amb@business@meth@meth_monitoring_cooking@monitoring@", "button_press_monitor", 1.0)
        exports['dg-ui']:addNotification("Geannuleerd..", "error")
    end)
end)

RegisterUICallback('sliders:close', function(data, cb)
    TriggerServerEvent("dg-labs:server:meth:SetSettings", currentLabId, currentSettingsId, data)
    currentSettingsId = nil
    closeApplication('sliders')
    cb({data = {}, meta = {ok = true, message = 'done'}})
end)

exports("hasMethPackage", function()
    return hasPackage
end)

exports("takeMethPackage", function()
    DGCore.Functions.Progressbar("meth_take_package", "Nemen...", 5000, false, true, {
        disableMovement = true,
        disableCarMovement = true,
        disableMouse = false,
        disableCombat = true
    }, {
        animDict = "rcmextreme3",
        anim = "idle",
        flags = 0
    }, {}, {}, function() -- Done
        StopAnimTask(PlayerPedId(), "rcmextreme3", "idle", 1.0)
        hasPackage = true
        attachBox()
    end, function() -- Cancel
        StopAnimTask(PlayerPedId(), "rcmextreme3", "idle", 1.0)
        exports['dg-ui']:addNotification("Geannuleerd..", "error")
    end)
end)

exports("removeMethPackage", function()
    removeBox()
    hasPackage = false
end)

exports("increaseMethStatus", function(statusId)
    local filled = DGCore.Functions.TriggerCallback("dg-labs:server:meth:GetStatus", currentLabId, statusId)
    if filled then
        exports['dg-ui']:addNotification("Dit zit al vol...", "error")
        return
    end

    if not hasPackage then
        exports['dg-ui']:addNotification("Je hebt niks vast...", "error")
        return 
    end

    hasPackage = false
    removeBox()
    exports["dg-keygame"]:OpenGame(function(success)
        if success then
            DGCore.Functions.Progressbar("meth_fill_station", "Vullen...", 8000, false, true, {
                disableMovement = true,
                disableCarMovement = true,
                disableMouse = false,
                disableCombat = true
            }, {
                animDict = "timetable@gardener@filling_can",
                anim = "gar_ig_5_filling_can",
                flags = 0
            }, {}, {}, function() -- Done
                StopAnimTask(PlayerPedId(), "timetable@gardener@filling_can", "gar_ig_5_filling_can", 1.0)
                TriggerServerEvent("dg-labs:server:meth:IncreaseStatus", currentLabId, statusId)
                DGX.Events.emitNet('hud:server:GainStress', math.random(1, 5)/10)
            end, function() -- Cancel
                StopAnimTask(PlayerPedId(), "timetable@gardener@filling_can", "gar_ig_5_filling_can", 1.0)
                exports['dg-ui']:addNotification("Geannuleerd..", "error")
            end)
        else
            exports['dg-ui']:addNotification("Mislukt...", "error")
        end
    end, 5, "hard")
end)

exports("collectMeth", function()
    local canCollect = DGCore.Functions.TriggerCallback("dg-labs:server:meth:CanCollect", currentLabId)
    if not canCollect then return end

    DGCore.Functions.Progressbar("meth_collect", "Verzamelen...", 2000, false, true, {
        disableMovement = true,
        disableCarMovement = true,
        disableMouse = false,
        disableCombat = true
    }, {
        animDict = "creatures@rottweiler@tricks@",
        anim = "petting_franklin",
        flags = 0
    }, {}, {}, function() -- Done
        StopAnimTask(PlayerPedId(), "creatures@rottweiler@tricks@", "petting_franklin", 1.0)
        TriggerServerEvent("dg-labs:server:meth:Collect", currentLabId)
        DGX.Events.emitNet('hud:server:GainStress', math.random(1, 3))
    end, function() -- Cancel
        StopAnimTask(PlayerPedId(), "creatures@rottweiler@tricks@", "petting_franklin", 1.0)
        exports['dg-ui']:addNotification("Geannuleerd...", "error")
    end)
end)