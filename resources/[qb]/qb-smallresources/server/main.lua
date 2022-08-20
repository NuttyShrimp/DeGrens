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

DGX.Inventory.registerUseable("harness", function(src, item)
  TriggerClientEvent('seatbelt:client:UseHarness', src, item)
end)

RegisterServerEvent('equip:harness')
AddEventHandler('equip:harness', function(item)
  local src = source
  local Player = DGCore.Functions.GetPlayer(src)
  if Player.PlayerData.items[item.slot].info.uses - 1 == 0 then
    Player.Functions.RemoveItem('harness', 1)
  else
    Player.PlayerData.items[item.slot].info.uses = Player.PlayerData.items[item.slot].info.uses - 1
    -- Player.Functions.SetInventory(Player.PlayerData.items, false)
  end
end)

RegisterServerEvent('seatbelt:DoHarnessDamage')
AddEventHandler('seatbelt:DoHarnessDamage', function(hp, data)
  local src = source
  local Player = DGCore.Functions.GetPlayer(src)

  if hp == 0 then
    Player.Functions.RemoveItem('harness', 1, data.slot)
  else
    Player.PlayerData.items[data.slot].info.uses = Player.PlayerData.items[data.slot].info.uses - 1
    -- Player.Functions.SetInventory(Player.PlayerData.items, false)
  end
end)

RegisterServerEvent('qb-carwash:server:washCar')
AddEventHandler('qb-carwash:server:washCar', function()
  local src = source
  local Player = DGCore.Functions.GetPlayer(src)
  local accountId = exports['dg-financials']:getDefaultAccountId(src)

  if exports['dg-financials']:removeCash(src, Config.DefaultPrice, 'carwash') then
    TriggerClientEvent('qb-carwash:client:washCar', src)
  elseif exports['dg-financials']:purchase(accountId, Player.PlayerData.citizenid, Config.DefaultPrice, "Carwash", 5) then
    TriggerClientEvent('qb-carwash:client:washCar', src)
  else
    TriggerClientEvent('DGCore:Notify', src, 'You dont have enough money..', 'error')
  end
end)

DGCore.Functions.CreateCallback('smallresources:server:GetCurrentPlayers', function(source, cb)
  local TotalPlayers = 0
  for k, v in pairs(DGCore.Functions.GetPlayers()) do
    TotalPlayers = TotalPlayers + 1
  end
  cb(TotalPlayers)
end)
