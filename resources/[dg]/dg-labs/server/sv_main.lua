labData = {}
states = {}

getLabTypeFromId = function(id)
    local retval = nil
    for labType, labId in pairs(labData.activeLabs) do
        if labId == id then
            retval = labType
            break
        end
    end
    return retval
end

DGCore.Functions.CreateCallback("dg-labs:server:GetActiveLabs", function(source, cb)
    while not next(labData) do Citizen.Wait(10) end
    cb(labData.activeLabs)
end)

-- load and refresh active labs
Citizen.CreateThread(function()
    labData = json.decode(LoadResourceFile(GetCurrentResourceName(), "labs.json"))

    -- refresh labs
    if not labData or os.time() - (60 * 60 * 24 * 7) > labData.lastRefresh then
        if not labData then labData = {} end
        labData.lastRefresh = os.time()
        labData.activeLabs = {}
        local generatedNumbers = {}
        for k, _ in pairs(getConfig().types) do
            local labId = math.random(#getConfig().labs)
            while generatedNumbers[labId] do
                labId = math.random(#getConfig().labs)
            end
            
            generatedNumbers[labId] = true
            labData.activeLabs[k] = labId
        end

        SaveResourceFile(GetCurrentResourceName(), "labs.json", json.encode(labData), -1)
        print("[LABS] Refreshed active labs")
    end

    -- set default data
    for labType, labId in pairs(labData.activeLabs) do
        states[labId] = json.decode(json.encode(getConfig().types[labType].defaultState))
        exports['dg-doorlock']:changeDoorLockState(getConfig().labs[labId].doorId, false)
    end
end)

AddEventHandler("onResourceStop", function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end
    
    for _, labId in pairs(labData.activeLabs) do
        exports['dg-doorlock']:changeDoorLockState(getConfig().labs[labId-1].doorId, true)
    end
end)

DGCore.Functions.CreateCallback("dg-labs:server:enoughPlayers", function(source, cb, labType)
    if not labType then return end
    local amount = DGCore.Shared.tableLen(DGCore.Functions.GetPlayers())
    local enoughPlayers = amount >= getConfig().requiredPeople[labType]
    cb(enoughPlayers)
end)

DGCore.Functions.CreateCallback("dg-labs:server:getPeekZones", function(source, cb, labType)
    if not labType then return end
    local amount = DGCore.Shared.tableLen(DGCore.Functions.GetPlayers())
    local enoughPlayers = amount >= getConfig().requiredPeople[labType]
    cb(enoughPlayers)
end)

