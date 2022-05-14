--- Use this lib file to use the DGX library in lua scripts.
DGX = nil

local function getProxy(proxyKey)
  return setmetatable({}, {
    __call = function(self, ...)
      local args = { ... }
      -- If the lib is initialized, we save it in another var
      local p = promise:new()
      
      Citizen.CreateThread(function()
        local lib = DGX
        -- split by | and loop with gmatch
        for k, v in string.gmatch(proxyKey, "([^|]+)") do
          -- TODO: Find way to see if the key exists
          lib = lib[k]
        end
        
        local result = lib(table.unpack(args))

        p:resolve(result)
      end)
      
      return p
    end,
    __index = function(t, k)
      return getProxy(proxyKey ~= nil and proxyKey .. '|' .. k or k)
    end
  })
end

DGX = getProxy()

Citizen.CreateThread(function()
  DGX = exports[GetCurrentResourceName()]:_getLibrary()
end)
