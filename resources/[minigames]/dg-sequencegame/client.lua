local gameOpen = false
local callback = {}

function OpenGame(cb, gridsize, length)
    if not gameOpen then
        gameOpen = true
        callback = cb

        SendNUIMessage({
            Action = "OpenGame",
            GridSize = gridsize,
            Length = length,
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
--             end, 4, 6)
--         end

--         Citizen.Wait(2)
--     end
-- end)