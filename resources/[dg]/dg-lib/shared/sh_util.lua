function vectorToTable(vector)
  return { vector.x, vector.y, vector.z }
end

function isFunction(f)
  if type(f) == "function" then
    return true
  end
  if type(f) == 'table' and rawget(f, '__cfx_functionReference') then
    return true
  end
  return false
end

function copyTbl(tbl)
  local newTbl = {}
  for k, v in pairs(tbl) do
    if isFunction(v) then
      newTbl[k] = v
    elseif type(v) == "table" then
      newTbl[k] = copyTbl(v)
    else
      newTbl[k] = v
    end
  end
  return newTbl
end

function splitStr(str, delimiter)
  local result = {}
  local from = 1
  local delim_from, delim_to = string.find(str, delimiter, from)
  while delim_from do
    result[#result + 1] = string.sub(str, from, delim_from - 1)
    from = delim_to + 1
    delim_from, delim_to = string.find(str, delimiter, from)
  end
  result[#result + 1] = string.sub(str, from)
  return result
end