# DeGrens events

## Event List

|          Event          | Direction | Description                                    |
|:-----------------------:|:---------:|:-----------------------------------------------|
|   `__dg_evt_s_s_emit`   | `S -> S`  | Tracked event from S to S                      |
|   `__dg_evt_c_c_emit`   | `C -> C`  | Tracked event from C to C                      |
| `__dg_evt_s_c_emitNet`  | `S -> C`  | Tracked and encrypted event from S to C        |
| `__dg_evt_c_s_emitNet`  | `C -> S`  | Tracked and encrypted event from C to S        |
| `__dg_evt_trace_start`  | `C -> S`  | Adds span to relevant Sentry transaction       |
| `__dg_evt_trace_finish` | `C -> S`  | Finishes span from relevant Sentry transaction |

## RPC Events

|          Event           | Direction | Description                                                         |
|:------------------------:|:---------:|:--------------------------------------------------------------------|
| `__dg_RPC_handleRequest` | `S -> S`  | Event from TS-Shared to other listening resource with RPC endpoints |
|  `__dg_RPC_trace_start`  | `C -> S`  | Creates a Sentry transaction for this RPC                           |
|  `__dg_RPC_s_c_request`  | `S -> C`  | Event indicating the Server wants data from Client                  |
|  `__dg_RPC_c_s_request`  | `C -> S`  | Event indicating the Client wants data from Server                  |
| `__dg_RPC_s_c_response`  | `S -> C`  | Event with the data from the a pending RPC                          |
| `__dg_RPC_c_s_response`  | `C -> S`  | Event with the data from the a pending RPC                          |

## Sentry Legend

- `ServerEvents`: Events handled on server
- `ClientEvents`: Events handled on client
- `.net`: Events coming from other side
- `.local`: Events coming from same side
- `.handler`: Where an event is performed
- `.emit`: Event is emitted
- `.collector`: Place where event comes in and is distributed to the right handlers

## Legend

`S`: Server

`C`: Client

`S -> S`: Server to Server