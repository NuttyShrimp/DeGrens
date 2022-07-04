function sendSentryRequest(data)
  local p = promise:new()
  PerformHttpRequest(string.format('https://sentry.nuttyshrimp.me/api/%s/store/',config.sentry.projectId), function(statusCode, data, headers)
    if statusCode ~= 200 then
      print("An error occured while sending an exception to Sentry, Status Code: "..statusCode)
      storeIssue(data)
      p:resolve(false)
      return
    end
    p:resolve(true)
    pushStoredIssues()
  end, 'POST', json.encode(data), {
    ["Content-Type"] = 'application/json',
    ["User-Agent"] = 'raven-Lua/1.0',
    Authorization = "DSN "..config.sentry.publicKey,
    ["X-Sentry-Auth"] = string.format('Sentry sentry_version=7,sentry_timestamp=%s,sentry_key=%s,sentry_secret=%s,sentry_client=raven-Lua/1.0', os.time(), config.sentry.publicKey, config.sentry.privateKey)
  })
  return p
end

function trySendingSentryIssue(resource, errorstr, isClient)
	Citizen.CreateThread(function()
    while not exports['dg-config']:areConfigsReady() do
      Wait(100)
    end
		local data = {
			event_id = GenerateUUID(),
			timestamp = os.date("!%Y-%m-%dT%H:%M:%SZ"),
			logger = "FiveM.Logger",
			platform = "other",
			release = config.version,
			environment = config.production and "production" or "development",
			tags = {
			  resource = resource,
			  isClient = isClient and "true" or "false"
			},
			exception = {
				type = errorstr:gsub(":(.*)", ""),
				value = errorstr,
			}
		}
    sendSentryRequest(data)
  end)
end

function storeIssue(data)
  storedIssues = LoadResourceFile(GetCurrentResourceName(), "./data/issues.json") 
  if storedIssues then
    storedIssues = json.decode(storedIssues)
  else
    storedIssues = {}
  end
  storedIssues[#storedIssues+1] = data
  SaveResourceFile(GetCurrentResourceName(), "./data/issues.json", json.encode(storedIssues), -1)
end

function pushStoredIssues()
  storedIssues = LoadResourceFile(GetCurrentResourceName(), "./data/issues.json") 
  if not storedIssues then
    return
  end
  storedIssues = json.decode(storedIssues)
  if #storedIssues == 0 then
    return
  end 
  Citizen.CreateThread(function()
    while not exports['dg-config']:areConfigsReady() do
      Wait(100)
    end
    local canPush = true
    local issueIdx = 1
    while canPush do
      local issue = storedIssues[issueIdx]
      if issue then
        requestPromise = sendSentryRequest(issue)
        canPush = Citizen.Await(requestPromise)
        if not canPush then
          SaveResourceFile(GetCurrentResourceName(), "./data/issues.json", json.encode(storedIssues), -1)
          break
        end
        table.remove(storedIssues, issueIdx)
      else
        canPush = false
      end
    end
  end)
end

RegisterServerEvent('dg-log:server:ErrorLog')
AddEventHandler('dg-log:reportClientError', function(resource, errorstr)
  trySendingSentryIssue(resource, errorstr, true)
end)

exports('trySendingSentryIssue', trySendingSentryIssue)

function GenerateUUID()
	return string.format("%07x%07x%07x%07x%04x",math.random(0, 0xfffffff),math.random(0, 0xfffffff),math.random(0, 0xfffffff),math.random(0, 0xfffffff),math.random(0, 0xffff))
end