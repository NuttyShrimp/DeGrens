DGCore.Functions.CreateCallback('elevator:server:getElevators', function(src, cb)
    while not exports['dg-config']:areConfigsReady() do
        Wait(10)
    end
    elevators = exports['dg-config']:getModuleConfig('elevators')
    cb(elevators)
end)