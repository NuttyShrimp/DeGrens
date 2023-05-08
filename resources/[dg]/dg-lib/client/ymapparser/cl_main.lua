local cachedObjects = {}
local cachedExtends = {}

function parse(name, saveToCache)
  local fileName = ('client/ymapparser/ymap/%s.ymap.xml'):format(name)
  if cachedObjects[name] and cachedExtends[name] then
    return cachedObjects[name], cachedExtends[name]
  end
  local shellObjects, extends = parseYMAP(fileName)
  if (shellObjects == nil) then
    return false
  end
  if (saveToCache) then
    cachedObjects[name] = shellObjects
    cachedExtends[name] = extends
  end
  return shellObjects, extends
end

exports('parse', parse)

function parseYMAP(fileName)
  local file = LoadResourceFile(GetCurrentResourceName(), fileName)
  local fileObjects = {}
  local currentFileObj = 1
  local ymapExtent = {
    min = { 0, 0, 0 },
    max = { 0, 0, 0 },
  }
  for line in string.gmatch(file, '[^\r\n]*') do
    if (string.find(line, 'archetypeName') or string.find(line, '<archetypeName>')) then
      local frstr = splitStr(line, 'e>')[2]
      local rrstr = splitStr(frstr, '</')[1]
      fileObjects[#fileObjects + 1] = {}
      fileObjects[currentFileObj].name = rrstr
    elseif (string.find(line, 'position')) then
      local spltstr = splitStr(line, '=')
      fileObjects[currentFileObj].x = tonumber(splitStr(spltstr[2], '"')[2])
      fileObjects[currentFileObj].y = tonumber(splitStr(spltstr[3], '"')[2])
      fileObjects[currentFileObj].z = tonumber(splitStr(spltstr[4], '"')[2])
    elseif (string.find(line, 'rotation')) then
      local spltstr = splitStr(line, '="')
      fileObjects[currentFileObj].rx = tonumber(splitStr(spltstr[2], '"')[1])
      fileObjects[currentFileObj].ry = tonumber(splitStr(spltstr[3], '"')[1])
      fileObjects[currentFileObj].rz = tonumber(splitStr(spltstr[4], '"')[1])
      fileObjects[currentFileObj].rw = tonumber(splitStr(spltstr[5], '"')[1])
      currentFileObj = currentFileObj + 1
    elseif string.find(line, "entitiesExtentsMin") then
      local spltstr     = splitStr(line, '="')
      ymapExtent.min[1] = tonumber(splitStr(spltstr[2], '"')[1])
      ymapExtent.min[2] = tonumber(splitStr(spltstr[3], '"')[1])
      ymapExtent.min[3] = tonumber(splitStr(spltstr[4], '"')[1])
    elseif string.find(line, "entitiesExtentsMax") then
      local spltstr     = splitStr(line, '="')
      ymapExtent.max[1] = tonumber(splitStr(spltstr[2], '"')[1])
      ymapExtent.max[2] = tonumber(splitStr(spltstr[3], '"')[1])
      ymapExtent.max[3] = tonumber(splitStr(spltstr[4], '"')[1])
    end
  end
  return fileObjects, ymapExtent
end