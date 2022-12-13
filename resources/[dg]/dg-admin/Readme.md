# dg-admin

## Binds

Only works when dev/admin mode is toggled ON
It is not the intended that dev/admin mode is always on. This action can also be triggered from within the menu.
The binds are primarily used in testing/development envs.

## Penalty

### Server

| Name           | Parameters                                                                                            | Returns                                     |
| -------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| ban            | `source: number`, `target: steamId or serverId`, `reason: string`, `points: number`, `length: number` | `Promise<void>`                             |
| kick           | `source: number`, `target: steamId or serverId`, `reason: string`, `points: number`                   | `Promise<void>`                             |
| warn           | `source: number`, `target: steamId or serverId`, `reason: string`                                     | `Promise<void>`                             |
| ACBan          | `target: steamId or serverId`, `reason: string`, `data?: Record<string, any>`                         | `Promise<void>`                             |
| isPlayerBanned | `target: steamId`                                                                                     | `Promise<{isBanned: bool, reason: string}>` |

## Permissions

### Server

| Name                | Parameters                       | Returns   |
| ------------------- | -------------------------------- | --------- |
| hasPlayerPermission | `source: number`, `role: string` | `boolean` |

## Whitelist

### Server

| Name                | Parameters       | Returns            |
| ------------------- | ---------------- | ------------------ |
| isPlayerWhitelisted | `source: number` | `Promise<boolean>` |
