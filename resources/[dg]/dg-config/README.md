# DG Configuration

Script that contains all our configurations

the name of the file in the seeding folder will be the key name of the configuration

eg. `financials.json` can be received with the keyname `financials`

## Events
Not via DGX because only server <-> server info transfer
server side only!

| name | description | parameters |
|------|-------------|------------|
| `dg-config:moduleLoaded`| Triggered when a config module is loaded in | ModuleId, ModuleData |
