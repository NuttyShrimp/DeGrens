# DG Jobs

## Groups

### Events

| Name                             | description                                                | parameters                                                |
| -------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------- |
| dg-jobs:server:groups:playerLeft | This event is fired if a specific member of a group leaves | `plyId: number or null`, `cid: number`, `groupId: string` |

## Job Whitelist

A module that handles the whitelisting of specific jobs.

- police
- ambulance

Each job should have a `HC` speciality. This is used to determine if the player is allowed to whitelist other players
for this job

A player can not assign ranks higher than their own rank.

### Events

Emitted from Server to Server and Client
| Name                  | description                                     | parameters                      |
| --------------------- | ----------------------------------------------- | ------------------------------- |
| dg-jobs:signin:update | Event is fired when player sign in/out of a job | `source: number`, `job: string` |

### Exports

| Name            | description                                                                                               | parameters                             |
| --------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| getCurrentJob   | Returns the job where the player is currently signed in (name of onDuty combined from qbcore)             | `source: number`                       |
| getCurrentGrade | Return the current grade/rank (0-based) for the current signed in job                                     | `source: number`                       |
| hasSpeciality   | Returns true if the player has the specified speciality (list can be found in config folder for each job) | `source: number`, `speciality: string` |
| isWhitelisted   | Check if a player can sign in at a certain whitelisted job                                                | `source: number`, `job: string`        |
| getPlayersForJob | get all serverIds of player signed in for a job | `job: string` |
