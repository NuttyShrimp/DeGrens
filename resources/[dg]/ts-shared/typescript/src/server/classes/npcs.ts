class Npcs {
  private npcIdsToDelete = new Set<string>();

  constructor() {
    on('onResourceStop', (resourceName: string) => {
      if (GetCurrentResourceName() !== resourceName) return;
      this.remove([...this.npcIdsToDelete]);
    });
  }

  public add = (npcData: NpcData | NpcData[]) => {
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
}

export default {
  Npcs: new Npcs(),
};
