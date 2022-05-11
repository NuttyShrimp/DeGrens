# NPC Manager

## Client sided exports
- addNpc: add a new NPC, provide object with needed data
  ```ts
  const npcData: NpcData;
  global.exports['dg-npcs'].addNpc(npcData);

  interface NpcData {
    id: string;
    model: number;
    position: Vec3;
    heading: number;
    distance: number;
    settings: Settings.Setting[];
    flags: Flag[];
    clothing?: string;
    scenario?: string;
  }
  declare namespace Settings {
    type Type = 'invincible' | 'ignore' | 'freeze' | 'collision';

    type Setting = {
      type: Type;
      active: boolean;
    };
  }
  type Flag = {
    name: string;
    active: boolean;
  };
  ```
- removeNpc: remove a registered NPC and deletes entity if exists, provide string id of npc
  ```ts
  global.exports['dg-npcs'].removeNpc('npc_id');
  ```
- setNpcState: enable/disable npc, provide string id of npc
  ```ts
  global.exports['dg-npcs'].setNpcState('npc_id');
  ```