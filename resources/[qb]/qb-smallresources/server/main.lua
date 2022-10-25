local VehicleNitrous = {}

RegisterServerEvent('tackle:server:TacklePlayer')
AddEventHandler('tackle:server:TacklePlayer', function(playerId)
  TriggerClientEvent("tackle:client:GetTackled", playerId)
end)

DGCore.Functions.CreateCallback('nos:GetNosLoadedVehs', function(source, cb)
  cb(VehicleNitrous)
end)

DGCore.Commands.Add("id", "Check Your ID #", {}, false, function(source, args)
  TriggerClientEvent('DGCore:Notify', source, "ID: " .. source)
end)

DGCore.Functions.CreateCallback('smallresources:server:GetCurrentPlayers', function(source, cb)
  local TotalPlayers = 0
  for k, v in pairs(DGCore.Functions.GetPlayers()) do
    TotalPlayers = TotalPlayers + 1
  end
  cb(TotalPlayers)
end)
