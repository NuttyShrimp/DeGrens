labData = {}

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

DGCore.Functions.CreateCallback("dg-labs:server:GetLabCoords", function(source, cb)
    cb(labCoords)
end)

DGCore.Functions.CreateCallback("dg-labs:server:GetActiveLabs", function(source, cb)
    while not next(labData) do Citizen.Wait(0) end
    cb(labData.activeLabs)
end)

-- load and refresh active labs
Citizen.CreateThread(function()
    labData = json.decode(LoadResourceFile(GetCurrentResourceName(), "labs.json"))

    -- new labs
    local currentTime = os.time()
    if not labData or currentTime - (60 * 60 * 24 * 7) > labData.lastRefresh then
        if not labData then labData = {} end
        labData.lastRefresh = currentTime
        labData.activeLabs = {}
        local generatedNumbers = {}
        for k, _ in pairs(Config.Types) do
            local labId = math.random(#Config.Labs)
            while generatedNumbers[labId] do
                labId = math.random(#Config.Labs)
            end
            
            generatedNumbers[labId] = true
            labData.activeLabs[k] = labId
        end

        SaveResourceFile(GetCurrentResourceName(), "labs.json", json.encode(labData), -1)
        print("Updated Active Labs")
    end

    -- set default data
    for labType, labId in pairs(labData.activeLabs) do
        Config.Labs[labId].data = json.decode(json.encode(Config.Types[labType].defaultData)) -- copy by value 
    end
end)

DGCore.Functions.CreateCallback("dg-labs:server:GetPlayerCount", function(source, cb)
    local amount = DGCore.Shared.tableLen(DGCore.Functions.GetPlayers())
    cb(amount)
end)