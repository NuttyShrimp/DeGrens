# Nutty-sounds
Custom GTA V Native sounds.

To add more, use the internal tool or send me a msg if I forgot to upload it to gitlab

Currently we only support small sounds. The .awc can't get bigger than 1.9MB.
If we need streams send me a msg and i will research and add it to the internal tool

Currently available sounds:
- DLC_NUTTY_SOUNDS:
  - phone_dial
  - phone_ringtone

To play a sounds:
```lua
-- Cache the soundid so we can stop it later
local soundId = -1

function myFunc()
  ...
  soundId = GetSoundId()
  PlaySound(soundId, 'phone_dial', 'DLC_NUTTY_SOUNDS', 0, 0, 1)
  -- OR
  PlaySoundFromCoord(soundId, 'phone_dial', x, y, z, 'DLC_NUTTY_SOUNDS', 1, 5.0, 0)
  -- OR for entity's we use a special manager bcs streamed sound don't like to be networked on players bcs of onesync infinity & the entitie ids not being the same
  exports["nutty-sounds"]:playSoundOnEntity('My_unique_id', 'phone_dial', 'DLC_NUTTY_SOUNDS', entity)
  ...
end

function myFunc2()
  StopSound(soundId)
  -- OR if we used the manager
  exports["nutty-sounds"]:stopSoundOnEntity('My_unique_id')
end
```