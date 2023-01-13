Config = Config or {}
Config.Server = Config.Server or {}

Config.Server.spawns = {
  base = {
    {
      label = 'Apartment',
      spawnType = 'apartment',
      position = vector4(-271.21, -958.01, 31.22, 27.0),
      isEnabled = function()
        return not exports['dg-apartments']:isInLockdown()
      end
    },
    {
      label = 'Bus station',
      spawnType = 'world',
      position = vector4(450.0159, -659.0424, 28.4686, 172.8842),
    },
    {
      label = 'Southside metro station',
      spawnType = 'world',
      position = vector4(100.3626, -1713.2968, 30.1125, 50.7161),
    },
    {
      label = 'Pinkcage motel',
      spawnType = 'world',
      position = vector4(324.7251, -231.2252, 54.2212, 3.0386),
    },
    {
      label = 'Del Perro Pier',
      spawnType = 'world',
      position = vector4(-1812.8571, -1223.1006, 19.1696, 227.161),
    }, {
      label = 'Boilingbroke Penitentiary',
      spawnType = 'world',
      position = vector4(1850.3678, 2585.6484, 45.6726, 259.1136),
    },
    {
      label = 'Paleto Bay',
      spawnType = 'world',
      position = vector4(-104.5433, 6316.094, 30.9496, 135.0),
    },
  },
  job = {
    police = {},
    ambulance = {},
  },
  prison = {
    label = 'Boilingbroke Penitentiary',
    spawnType = 'world',
    position = vector4(1767.6893, 2501.2747, 49.693, 210.6193)
  }
}