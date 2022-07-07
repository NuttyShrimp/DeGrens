local oldTrace = Citizen.Trace

local errorWords = { "failure", "error", "not", "failed", "not safe", "invalid", "cannot", ".lua", "server", "client", "attempt", "traceback", "stack", "function" }

function Citizen.Trace(...)
	local isError = false
	oldTrace(...)
	if type(...) == "string" then
		args = string.lower(...)

		for _, word in ipairs(errorWords) do
			if string.find(args, word) then
				exports['dg-logs']:trySendingSentryIssue(GetCurrentResourceName(), ..., false)
				isError = true
				return
			end
		end
	end
	if not isError then
		return
	end
end
