local DGCore = exports['dg-core']:GetCoreObject()

DGCore.Functions.CreateCallback("dg-npcs:server:FetchNPCs", function(source, cb)
    cb(NPCS)
end)