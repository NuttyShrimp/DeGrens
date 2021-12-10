hackingCallback = {}

AddEventHandler('dg-hackinggame:StartHack', function(length, amount, callback)
    hackingCallback = callback
	SendNUIMessage({
        Action = "ShowGame",
        SequenceLength = length,
        AmountOfTimes = amount,
    })
    SetNuiFocus(true, true)
end)

RegisterNUICallback('GameClose', function()
    SetNuiFocus(false, false)
end)

RegisterNUICallback('GameFinished', function(data)
    hackingCallback(data.Result)
end)