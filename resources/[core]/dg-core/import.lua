if GetCurrentResourceName() == 'dg-core' then
    function GetSharedObject()
        return DGCore
    end

    exports('GetSharedObject', GetSharedObject)
end

if GetResourceState('dg-core') == 'started' then
  DGCore = exports['dg-core']:GetSharedObject()
end