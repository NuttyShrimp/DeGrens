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

-- This returns the diffs between tbl1 and tbl2 this will result in a table with keys added & removed
DGShared.GetTableDiff = function(tbl1, tbl2)
	diff = {added = {}, removed = {}}
	for k, v in pairs(tbl1) do
		if v == nil then goto skip_to_next end
		if not tbl2[k] or DGShared.isDiff(v, tbl2[k]) then
			diff.removed[k] = v
		end
		::skip_to_next::
	end
	for k, v in pairs(tbl2) do
		if v == nil then goto skip_to_next end
		if not tbl1[k] or DGShared.isDiff(tbl1[k], v) then
			diff.added[k] = v
		end
		::skip_to_next::
	end
	return diff
end

DGShared.isDiff = function(v1, v2)
	if type(v1) ~= type(v2) then
		return true
	end
	if type(v1) == "table" then
		for k, v in pairs(v1) do
			if type(v) == "table" then
				if DGShared.isDiff(v, v2[k]) then
					return true
				end
			else
				if v ~= v2[k] then
					return true
				end
			end
		end
		for k, v in pairs(v2) do
			if type(v) == "table" then
				if DGShared.isDiff(v1[k], v) then
					return true
				end
			else
				if v1[k] ~= v then
					return true
				end
			end
		end
		return false
	end
	return v1 ~= v2
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

DGShared.tableLen = function(tbl)
	local count = 0
	for _, v in pairs(tbl) do
		if v ~= nil then
			count = count + 1
		end
	end
	return count
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

-- Gangs
DGShared.Gangs = {
	['none'] = {
		label = 'No Gang',
		grades = {
            ['0'] = {
                name = 'Unaffiliated'
            },
        },
	},
	['lostmc'] = {
		label = 'The Lost MC',
		grades = {
            ['0'] = {
                name = 'Recruit'
            },
			['1'] = {
                name = 'Enforcer'
            },
			['2'] = {
                name = 'Shot Caller'
            },
			['3'] = {
                name = 'Boss',
				isboss = true
            },
        },
	},
	['ballas'] = {
		label = 'Ballas',
		grades = {
            ['0'] = {
                name = 'Recruit'
            },
			['1'] = {
                name = 'Enforcer'
            },
			['2'] = {
                name = 'Shot Caller'
            },
			['3'] = {
                name = 'Boss',
				isboss = true
            },
        },
	},
	['vagos'] = {
		label = 'Vagos',
		grades = {
            ['0'] = {
                name = 'Recruit'
            },
			['1'] = {
                name = 'Enforcer'
            },
			['2'] = {
                name = 'Shot Caller'
            },
			['3'] = {
                name = 'Boss',
				isboss = true
            },
        },
	},
	['cartel'] = {
		label = 'Cartel',
		grades = {
            ['0'] = {
                name = 'Recruit'
            },
			['1'] = {
                name = 'Enforcer'
            },
			['2'] = {
                name = 'Shot Caller'
            },
			['3'] = {
                name = 'Boss',
				isboss = true
            },
        },
	},
	['families'] = {
		label = 'Families',
		grades = {
            ['0'] = {
                name = 'Recruit'
            },
			['1'] = {
                name = 'Enforcer'
            },
			['2'] = {
                name = 'Shot Caller'
            },
			['3'] = {
                name = 'Boss',
				isboss = true
            },
        },
	},
	['triads'] = {
		label = 'Triads',
		grades = {
            ['0'] = {
                name = 'Recruit'
            },
			['1'] = {
                name = 'Enforcer'
            },
			['2'] = {
                name = 'Shot Caller'
            },
			['3'] = {
                name = 'Boss',
				isboss = true
            },
        },
	}
}

