cachedIds = {}
currentWeaponData = nil
targettingLoopRunning = false

ammoConfig = {}

Citizen.CreateThread(function()
  ammoConfig = DGCore.Functions.TriggerCallback('dg-weapons:server:getAmmoConfig')

  for _, hash in pairs(pickupHashes) do
    ToggleUsePickupsForPlayer(PlayerId(), hash, false)
  end
end)
