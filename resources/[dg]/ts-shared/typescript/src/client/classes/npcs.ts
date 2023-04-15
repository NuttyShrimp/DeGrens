class Npcs {
  private npcIdsToDelete = new Set<string>();

  constructor() {
    on('onResourceStop', (resourceName: string) => {
      if (GetCurrentResourceName() !== resourceName) return;
      this.npcIdsToDelete.forEach(id => {
        this.remove(id);
      });
    });
  }

  public add = (npcData: NpcData) => {
    global.exports['dg-npcs'].addNpc(npcData);
    this.npcIdsToDelete.add(npcData.id);
  };

  public remove = (npcId: string) => {
    global.exports['dg-npcs'].removeNpc(npcId);
    this.npcIdsToDelete.delete(npcId);
  };

  public findPedData = (ped: number) => {
    return global.exports['dg-npcs'].findPedData(ped);
  };

  public setEnabled = (npcId: string, enabled: boolean) => {
    global.exports['dg-npcs'].setNpcEnabled(npcId, enabled);
  };
}

export default {
  Npcs: new Npcs(),
};
