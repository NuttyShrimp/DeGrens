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

isEntryInList = function(entries, data)
	for _, v in pairs(entries) do
		if v._metadata.name == data.name and v._metadata.index == data.index then
			return true
		end
	end
end

combineTables = function(t1, t2)
	local t3 = {}
	for k, v in pairs(t1) do
		t3[k] = v
	end
	for k, v in pairs(t2) do
		if type(v) == "table" then
			t3[k] = combineTables(t3[k], v)
		else
			t3[k] = v
		end
	end
	return t3
end