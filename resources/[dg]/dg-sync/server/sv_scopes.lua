local scopes = {}
local recentLeft = {};

AddEventHandler("playerEnteredScope", function(data)
  local playerEntering, player = tostring(data.player), tostring(data["for"])

  if not scopes[player] then
    scopes[player] = {}
  end

  if recentLeft[player] then
    recentLeft[player][playerEntering] = nil
  end

  scopes[player][playerEntering] = {
    source = playerEntering,
    steamId = Player(playerEntering).state.steamId,
  }
end)

AddEventHandler("playerLeftScope", function(data)
  local playerLeaving, player = tostring(data.player), tostring(data["for"])

  if not scopes[player] then return end
  local scopeInfo = scopes[player][playerLeaving]
  scopes[player][playerLeaving] = nil
  if scopeInfo then
    if not recentLeft[player] then
      recentLeft[player] = {}
    end
    recentLeft[player][playerLeaving] = scopeInfo
    SetTimeout(30000, function()
      if not recentLeft[player] then return end
      recentLeft[player][playerLeaving] = nil
    end)
  end
end)

AddEventHandler("playerDropped", function()
  local intSource = source
  if not intSource then return end
  local src = tostring(intSource);

  scopes[src] = nil
  recentLeft[src] = nil

  for owner, tbl in pairs(scopes) do
    if tbl[src] then
      tbl[src] = nil
    end
  end
end)

function GetPlayerScope(intSource)
  local currentScopeInfo = {}
  if (scopes[tostring(intSource)]) then
    for _, info in pairs(scopes[tostring(intSource)]) do
      currentScopeInfo[#currentScopeInfo + 1] = info
    end
  end
  local recentScopeInfo = {}
  if (recentLeft[tostring(intSource)]) then
    for _, info in pairs(recentLeft[tostring(intSource)]) do
      recentScopeInfo[#recentScopeInfo + 1] = info
    end
  end
  return {
    current = currentScopeInfo,
    recent = recentScopeInfo
  }
end

DGX.RPC.register('sync:scopes:get', function(src)
  return GetPlayerScope(src)
end)