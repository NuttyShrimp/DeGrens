if GetCurrentResourceName() == 'dg-core' then
    function GetSharedObject()
        return DGCore
    end

    exports('GetSharedObject', GetSharedObject)
end

DGCore = exports['dg-core']:GetSharedObject()