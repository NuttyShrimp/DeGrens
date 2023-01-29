function saveToFile(text)
  local fileName = "dev-save.txt"
	local file = io.open(fileName, "a")
	if file then
		file:write(text .. '\n')
	end
	file:close()
end

exports('saveToFile', saveToFile)
RegisterNetEvent('dev:saveToFile', saveToFile)