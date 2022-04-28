# DG Auth
Events list
Outgoing:
- `__dg_auth_register` --> Is registered in library on clientside and will response if this resources want to send events
- `__dg_auth_res_list` --> After all resource are registered this will be send to the server side of the library to generate our maps on
- `__dg_auth_register_answer` --> This is send as answer to the `__dg_auth_register` event to indicate it wants to send events
- `__dg_auth_seedMaps` --> Ply has joined and token is generated, server needs to create map for this player
- `__dg_auth_authenticated` --> Send to client to indicate it is ready
