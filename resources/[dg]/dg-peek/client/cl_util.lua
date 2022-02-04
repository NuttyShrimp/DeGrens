isItemInArray = function(array, item)
	for i = 1, #array do
		if array[i] == item then
			return true
		end
	end
	return false
end

getValueFromTable = function(table, key)
	for k, v in pairs(table) do
		if k == key then
			return v
		end
	end
	return nil
end

combineTables = function(t1, t2)
	local t3 = {}
	for k, v in pairs(t1) do
		t3[k] = v
	end
	for k, v in pairs(t2) do
		if type(v) == "table" then
			t3[k] = combineTables(t3[k], v)
		elseif type(v) == 'number' then
			table.insert(t3, v)
		else
			t3[k] = v
		end
	end
	return t3
end

hasActiveEntries = function(activeEntries)
	local hasActiveEntries = false
	for _, entry in pairs(activeEntries) do
		if #entry > 0 then
			hasActiveEntries = true
			break
		end
	end
	return hasActiveEntries
end

getEntryById = function(activeEntries, id)
	for sub, entries in pairs(activeEntries) do
		for _, entry in ipairs(entries) do
			if tonumber(entry.id) == tonumber(id) then
				return entry
			end
		end
	end
end