config = nil
hasStoredEntries = false

Citizen.CreateThread(function() 
  while not exports['dg-config']:areConfigsReady() do
    Wait(100)
  end
  config = exports['dg-config']:getModuleConfig('main')
  setCorrectServer()
end)

RegisterNetEvent('dg-config:moduleLoaded', function (modId, modConfig)
  if modId ~= 'main' then
    return
  end
  config = modConfig
  setCorrectServer()
end)

setCorrectServer = function()
  if not config then return end
  if not config.production then
    config.logServer = config.devLogServer
  end
end

createGraylogEntry = function(logtype, data, message, isImportant, timestamp)
  local p = promise:new()
  if not timestamp then
    timestamp = os.time(os.date("!*t"))
  end
	Citizen.CreateThread(function()
    while not exports['dg-config']:areConfigsReady() do
      Wait(100)
    end
    data = data ~= nil and data or {}
    if isImportant then
      data.important = true
    end
    local message = {
			version = "2.1",
			host = "dg2.degrensrp.be",
			short_message = message or logtype,
			_resource = GetInvokingResource(),
			_logtype = logtype,
			full_message = json.encode(data, { indent = true }),
      timestamp = timestamp
		}

		PerformHttpRequest(config.logServer, function(statusCode)
      if statusCode >= 300 then
        storeEntry(message)
        p:resolve(true)
        return
      end
      p:resolve(false)
		end, 'POST', json.encode(message), { ['Content-Type'] = 'application/json' })
	end)
  return p
end

exports('createGraylogEntry', createGraylogEntry)

--- region Storage
function storeEntry(msg)
  local storedentries = LoadResourceFile(GetCurrentResourceName(), "./data/logs.json")
  if storedentries then
    storedEntries = json.decode(storedEntries)
  else
    storedEntries = {}
  end
  storedentries[#storedentries+1] = msg
  SaveResourceFile(GetCurrentResourceName(), "./data/logs.json", json.encode(storedEntries), -1)
  hasStoredEntries = true
end

function sendStoredEntries()
  if not hasStoredEntries then
    return
  end
  local storedentries = LoadResourceFile(GetCurrentResourceName(), "./data/logs.json")
  if not storedEntries then
    hasStoredEntries = false
    return
  end
  storedEntries = json.decode(storedEntries)
  if #storedEntries == 0 then
    hasStoredEntries = false
    return
  end
  Citizen.CreateThread(function()
    while not exports['dg-config']:areConfigsReady() do
      Wait(100)
    end
    local canPush = true
    local entryIdx = 1
    while canPush do
      local entry = storedIssues[entryIdx]
      if entry then
        requestPromise = storeEntry(entry)
        canPush = Citizen.Await(requestPromise)
        if not canPush then
          hasStoredEntries = true
          break
        end
        table.remove(storedEntries, entryIdx)
      else
        canPush = false
      end
    end
  end)
end
--- endregion
