--- Use this lib file to use the DGX library in lua scripts.
DGX = nil

local function getProxy(proxyKey)
  return setmetatable({}, {
    __call = function(self, ...)
      args = { ... }
      -- If the lib is initialized, we save it in another var
      lib = DGX
      -- split by | and loop with gmatch
      for k, v in string.gmatch(proxyKey, "([^|]+)") do
        -- TODO: Find way to see if the key exists
        lib = lib[k]
      end
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
