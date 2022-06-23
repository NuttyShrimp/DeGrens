local cachedObjects = {}

function parse (name, saveToCache)
	local fileName = ('client/ymapparser/ymap/%s.ymap.xml'):format(name)
	if cachedObjects[name] then
		return cachedObjects[name]
	end
	local shellObjects = parseYMAP(fileName)
	if (shellObjects == nil) then
		return false
	end
	if (saveToCache) then
		cachedObjects[name] = shellObjects
	end
	return shellObjects
end

exports('parse', parse)

function parseYMAP(fileName)
	local splitstr = DGCore.Shared.SplitStr
	local file = LoadResourceFile(GetCurrentResourceName(), fileName)
	local fileObjects = {}
	local currentFileObj = 1
	for line in string.gmatch(file, '[^\r\n]*') do
		if (string.find(line, 'archetypeName') or string.find(line, '<archetypeName>')) then
			local frstr = splitstr(line, 'e>')[2]
			local rrstr = splitstr(frstr, '</')[1]
			fileObjects[#fileObjects+1] = {}
			fileObjects[currentFileObj].name = rrstr
		elseif (string.find(line, 'position')) then
			local spltstr = splitstr(line, '=')
			fileObjects[currentFileObj].x = tonumber(splitstr(spltstr[2], '"')[2])
			fileObjects[currentFileObj].y = tonumber(splitstr(spltstr[3], '"')[2])
			fileObjects[currentFileObj].z = tonumber(splitstr(spltstr[4], '"')[2])
		elseif (string.find(line, 'rotation')) then
			local spltstr = splitstr(line, '="')
			fileObjects[currentFileObj].rx = tonumber(splitstr(spltstr[2], '"')[1])
			fileObjects[currentFileObj].ry = tonumber(splitstr(spltstr[3], '"')[1])
			fileObjects[currentFileObj].rz = tonumber(splitstr(spltstr[4], '"')[1])
			fileObjects[currentFileObj].rw = tonumber(splitstr(spltstr[5], '"')[1])
			currentFileObj = currentFileObj + 1
		end
	end
	return fileObjects
end
