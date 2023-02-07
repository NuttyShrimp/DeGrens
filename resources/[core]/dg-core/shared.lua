DGShared = {}

local StringCharset = {}
local NumberCharset = {}

for i = 48,  57 do NumberCharset[#NumberCharset+1] = string.char(i) end
for i = 65,  90 do StringCharset[#StringCharset+1] = string.char(i) end
for i = 97, 122 do StringCharset[#StringCharset+1] = string.char(i) end

DGShared.RandomStr = function(length)
    if length > 0 then
        return DGShared.RandomStr(length - 1) .. StringCharset[math.random(1, #StringCharset)]
    else
        return ''
    end
end

DGShared.RandomInt = function(length)
    if length > 0 then
        return DGShared.RandomInt(length - 1) .. NumberCharset[math.random(1, #NumberCharset)]
    else
        return ''
    end
end

DGShared.copyTbl = function(tbl)
	local newTbl = {}
	for k, v in pairs(tbl) do
        if DGShared.isFunction(v) then
            newTbl[k] = v
		elseif type(v) == "table" then
			newTbl[k] = DGShared.copyTbl(v)
		else
			newTbl[k] = v
		end
	end
	return newTbl
end

DGShared.isFunction = function(f)
	if type(f) == "function" then
		return true
	end
	if type(f) == 'table' and rawget(f, '__cfx_functionReference') then
		return true
	end
	return false
end

DGShared.isStringEmpty = function(str)
  if str == nil then
    return true
  end
  if str:match( "^%s*(.-)%s*$" ) == '' then
    return true
  end
  return false
end

DGShared.SplitStr = function(str, delimiter)
  local result = { }
  local from = 1
  local delim_from, delim_to = string.find(str, delimiter, from)
  while delim_from do
    result[#result+1] = string.sub(str, from, delim_from - 1)
    from = delim_to + 1
    delim_from, delim_to = string.find(str, delimiter, from)
  end
  result[#result+1] = string.sub(str, from)
  return result
end