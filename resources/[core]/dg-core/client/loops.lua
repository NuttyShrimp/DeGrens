CreateThread(function()
  while true do
    Wait(0)
    if LocalPlayer.state.isLoggedIn then
      Wait((1000 * 60) * DGCore.Config.UpdateInterval)
      TriggerServerEvent('DGCore:UpdatePlayer')
    end
  end
end)

CreateThread(function()
    while true do
        Wait(DGCore.Config.StatusInterval)
        if LocalPlayer.state.isLoggedIn then
            if DGCore.Functions.GetPlayerData().metadata['hunger'] <= 0 or
                    DGCore.Functions.GetPlayerData().metadata['thirst'] <= 0 then
                local ped = PlayerPedId()
                local currentHealth = GetEntityHealth(ped)
                SetEntityHealth(ped, currentHealth - math.random(5, 10))
            end
        end
    end
end)