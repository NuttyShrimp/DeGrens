# Core

## Events
- These events get emitted from server!

### Server
| Eventname                      | Args                                                     |
| ------------------------------ | -------------------------------------------------------- |
| `DGCore:server:playerLoaded`   | `playerData: PlayerData`                                 |
| `DGCore:server:playerUnloaded` | `plyId: number`, `cid: number`, `playerData: PlayerData` |

### Client
| Eventname                      | Args                     |
| ------------------------------ | ------------------------ |
| `DGCore:client:playerLoaded`   | `playerData: PlayerData` |
| `DGCore:client:playerUnloaded` | `cid: number`            |