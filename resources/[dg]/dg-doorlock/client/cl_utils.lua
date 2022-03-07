debouncing = {}

Debounce = function(event, time)
    for _,v in ipairs(debouncing) do
        if v == event then
            return true
        end
    end
    table.insert(debouncing, event)
    startTimeout(event, time)
end

startTimeout = function(event, time)
    SetTimeout(time, function()
        for k,v in ipairs(debouncing) do
            if v == event then
                debouncing[k] = nil
            end
        end
    end)
end