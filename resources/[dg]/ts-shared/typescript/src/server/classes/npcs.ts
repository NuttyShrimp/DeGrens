class Npcs {
  private npcIdsToDelete = new Set<string>();

  constructor() {
    on('onResourceStop', (resourceName: string) => {
      if (GetCurrentResourceName() !== resourceName) return;
      this.remove([...this.npcIdsToDelete]);
    });
  }

  public add = (npcData: NPCs.NPC | NPCs.NPC[]) => {
    global.exports['dg-npcs'].addNpc(npcData);

    if (Array.isArray(npcData)) {
      npcData.forEach(x => this.npcIdsToDelete.add(x.id));
    } else {
      this.npcIdsToDelete.add(npcData.id);
    }
  };

  public remove = (id: string | string[]) => {
    global.exports['dg-npcs'].removeNpc(id);

    if (Array.isArray(id)) {
      id.forEach(x => this.npcIdsToDelete.delete(x));
    } else {
      this.npcIdsToDelete.delete(id);
    }
  };

  public spawnGuard = (guardData: NPCs.Guard) => {
    global.exports['dg-npcs'].spawnGuard(guardData);
  };
}

export default {
  Npcs: new Npcs(),
};
