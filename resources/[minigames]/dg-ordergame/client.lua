local gameOpen = false
local callback = {}

function OpenGame(cb, gridsize, length, amount, showtime, inputtime)
    if not gameOpen then
        gameOpen = true
        callback = cb

        SendNUIMessage({
            Action = "OpenGame",
            GridSize = gridsize,
            SequenceLength = length,
            AmountOfTimes = amount,
            ShowTime = showtime,
            InputTime = inputtime
        })
        SetNuiFocus(true, true)
    end
end

RegisterNUICallback('GameFinished', function(data)
    gameOpen = false
    SetNuiFocus(false, false)
    callback(data.Result)
end)

exports("OpenGame", OpenGame)

-- test the game with uparrowkey
-- Citizen.CreateThread(function()
--     while true do
--         if IsControlJustPressed(0, 27) then
--             OpenGame(function(success)
--                 print(success)
--             end, 5, 6, 3, 1, 3)
--         end
--         Citizen.Wait(2)
--     end
-- end)