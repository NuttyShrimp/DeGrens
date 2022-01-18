local debug_mode = GetConvar('is_production', 'true') == 'false'
local oldError = error
local oldTrace = Citizen.Trace

local errorWords = { "failure", "error", "not", "failed", "not safe", "invalid", "cannot", ".lua", "server", "client", "attempt", "traceback", "stack", "function" }

function error(...)
	local resource = GetCurrentResourceName()
	print("------------------ ERROR IN RESOURCE: " .. resource)
	print(...)
	print("------------------ END OF ERROR")

	TriggerServerEvent("dg-log:reportClientError", resource, ...)
end

function Citizen.Trace(...)
	local isError = false
	if type(...) == "string" then
		args = string.lower(...)

		for _, word in ipairs(errorWords) do
			if string.find(args, word) then
				error(...)
				isError = true
				return
			end
		end
	end
	if not isError then
		return
	end
	oldTrace(...)
end

debug = function(msg, ...)
	if not debug_mode then
		return
	end

	local params = {}

	for _, param in ipairs({ ... }) do
		if type(param) == "table" then
			param = json.encode(param)
		end

		params[#params + 1] = param
	end

	print((msg):format(table.unpack(params)))
end