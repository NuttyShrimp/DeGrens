local oldTrace = Citizen.Trace

local errorWords = { "failure", "error", "not", "failed", "not safe", "invalid", "cannot", ".lua", "server", "client", "attempt", "traceback", "stack", "function" }

function Citizen.Trace(...)
	local isError = false
	if type(...) == "string" then
		args = string.lower(...)

		for _, word in ipairs(errorWords) do
      if string.find(args, word) then
        oldTrace(...)
				exports['dg-logs']:trySendingSentryIssue(GetCurrentResourceName(), ..., false)
				return
			end
		end
	end
  oldTrace(...)
end
