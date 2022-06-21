local config = nil
getConfig = function()
    if not config then
        while not exports['dg-config']:areConfigsReady() do 
            Wait(10) 
        end
        config = exports['dg-config']:getModuleConfig('labs')
    end
    return config
end

DGCore.Functions.CreateCallback('dg-labs:server:getConfig', function(src, cb)
    local data = getConfig()
    cb(data)
end)