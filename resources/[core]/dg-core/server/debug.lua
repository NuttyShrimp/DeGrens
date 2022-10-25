function DGCore.ShowError(resource, msg)
    print('\x1b[31m[' .. resource .. ':ERROR]\x1b[0m ' .. msg)
end

function DGCore.ShowSuccess(resource, msg)
    print('\x1b[32m[' .. resource .. ':LOG]\x1b[0m ' .. msg)
end