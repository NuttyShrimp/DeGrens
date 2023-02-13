DGCore = {}
DGCore.PlayerData = {}
DGCore.Config = DGConfig
DGCore.Shared = DGShared
DGCore.ServerCallbacks = {}

exports('GetCoreObject', function()
  return DGCore
end)

-- thread and evt from client so starting time is based on when ply joined
-- this hopefully reduces stress on server because not all players get saved at the same time
CreateThread(function()
  while true do
    Wait(1000 * 60 * DGCore.Config.UpdateInterval)
    TriggerServerEvent('DGCore:server:save')
  end
end)