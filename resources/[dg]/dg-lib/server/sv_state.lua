DGX.RPC.register("lib:state:ensureReplicated", function(src, netId, stateKey, stateValue)
  local ent = NetworkGetEntityFromNetworkId(netId)
  if ent == nil or not DoesEntityExist(ent) then
    return
  end

  Entity(ent).state:set(stateKey, stateValue, true)
end)