declare interface ClientExports {
  npcs: {
    addNpc: (npcData: NPCs.NPC | NPCs.NPC[]) => void;
    removeNpc: (id: string | string[]) => void;
    getPedData: (ped: number) => NPCs.NPC | undefined;
    setNpcEnabled: (id: string, enabled: boolean) => void;
  };
}
