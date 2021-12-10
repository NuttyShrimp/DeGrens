local gameOpen = false
local callback = {}

function OpenGame(cb, amount, difficulty)
    if not gameOpen then
        gameOpen = true
        callback = cb

        SendNUIMessage({
            Action = "OpenGame",
            Amount = amount,
            Difficulty = difficulty, -- can be "easy", "medium", "hard" or "extreme"
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

Citizen.CreateThread(function()
    while true do
        if IsControlJustPressed(0, 27) then
            OpenGame(function(success)
                print(success)
            end, 3, "hard")
        end

        Citizen.Wait(2)
    end
end)

