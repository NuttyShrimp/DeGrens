-- Array to keep insertion order
local entries = {}

-- First remove old one if exists with name but need forloopke because we use array to keep order
registerInfoEntry = function(data)
  local keyToReplace = #entries + 1

  -- if entry with name already exists then use that key to replace old
  for k, v in pairs(entries) do
    if v.name == data.name then
      keyToReplace = k
      break
    end
  end

  entries[keyToReplace] = data
end

cleanInfoEntries = function()
  entries = {}
end

exports('registerInfoEntry', registerInfoEntry)

RegisterNetEvent('dg-phone:load', function()
  registerInfoEntry({
    name = 'id',
    icon = 'id-card',
    prefix = '#',
    getter = function()
      return LocalPlayer.state.citizenid
    end,
  })
  registerInfoEntry({
    name = 'phone',
    icon = 'hashtag',
    getter = function()
      return charModule.getCharinfo().phone
    end,
  })
  registerInfoEntry({
    name = 'cash',
    icon = 'wallet',
    color = '#81c784',
    prefix = '€',
    getter = function()
      local cash = exports['dg-financials']:getCash()
      return math.floor(cash)
    end,
  })
  registerInfoEntry({
    name = 'bank',
    icon = 'piggy-bank',
    color = '#64b5f6',
    prefix = '€',
    getter = function()
      local account = DGX.RPC.execute('financials:getDefaultAccount')
      if not account then return 0 end
      return math.floor(account.balance) or 0
    end,
  })
end)

RegisterUICallback("phone/info/fetchInfo", function(data, cb)
  local uiEntries = {}
  for _, v in pairs(entries) do
    local value = v.getter()
    uiEntries[#uiEntries + 1] = {
      name = v.name,
      icon = v.icon,
      color = v.color,
      prefix = v.prefix,
      value = value,
    }
  end
  cb({ data = uiEntries, meta = { ok = true, message = "done" } })
end)

-- ts version for if this ever gets refactored

-- type Entry = { name: string; icon: string; prefix?: string; color?: string; getter: () => number | string };
-- type UIEntry = Omit<Entry, 'getter'> & { value: ReturnType<Entry['getter']> };

-- // Map keeps insertion order
-- const entries: Map<string, Entry> = new Map();

-- const registerInfoEntry = (data: Entry) => {
--   entries.set(data.name, data);
-- };

-- const cleanInfoEntries = () => {
--   entries.clear();
-- };

-- global.exports('registerInfoEntry', registerInfoEntry);

-- onNet('dg-phone:load', () => {
--   registerInfoEntry({
--     name: 'id',
--     icon: 'id-card',
--     prefix: '#',
--     getter: () => {
--       return DGCore.Functions.GetPlayerData().citizenid;
--     },
--   });
--   registerInfoEntry({
--     name: 'phone',
--     icon: 'hashtag',
--     getter: () => {
--       return DGCore.Functions.GetPlayerData().charinfo.phone;
--     },
--   });
--   registerInfoEntry({
--     name: 'cash',
--     icon: 'wallet',
--     prefix: '€',
--     color: '#81c784',
--     getter: () => {
--       return global.exports['dg-financials'].getCash();
--     },
--   });
--   registerInfoEntry({
--     name: 'bank',
--     icon: 'piggy-bank',
--     prefix: '€',
--     color: '#64b5f6',
--     getter: () => {
--       const acc = RPC.execute('financials:getDefaultAccount');
--       return acc?.balance ?? 0;
--     },
--   });
-- });

-- UI.RegisterUICallback('phone/info/fetchInfo', (_, cb) => {
--   const uiEntries: UIEntry[] = [];
--   for (const [_, entry] of entries) {
--     const { getter, ...data } = entry;
--     const value = getter();
--     uiEntries.push({
--       ...data,
--       value,
--     });
--   }
--   cb({ data: entries, meta: { ok: true, message: 'done' } });
-- });