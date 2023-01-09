import { Util } from '@dgx/client';
import { Export, ExportRegister } from '@dgx/shared/decorators';
import { Npc } from './npc';

@ExportRegister()
class Handler extends Util.Singleton<Handler>() {
  private npcs: Map<string, Npc> = new Map();
  private configNpcs: Set<string> = new Set(); // ids of npc that got added from config, these get removed when config gets reloaded

  private getNpc = (id: string) => {
    if (!id) {
      throw new Error(`[NPCS] Tried to get NPC without providing id`);
    }
    return this.npcs.get(id);
  };

  constructor() {
    super();
    on('onResourceStop', (resourceName: string) => {
      if (GetCurrentResourceName() !== resourceName) return;
      this.npcs.forEach(npc => {
        npc.delete();
      });
    });
  }

  public loadConfig = (npcData: NpcData[]) => {
    // Delete all existing npcs originated from config
    this.configNpcs.forEach(id => {
      this.removeNpc(id);
    });
    npcData.forEach(data => {
      this.addNpc(data);
      this.configNpcs.add(data.id);
    });
  };

  @Export('addNpc')
  private addNpc = (npcData: NpcData) => {
    if (this.getNpc(npcData.id)) {
      throw new Error(`[NPCS] Tried to add NPC with already registered id: ${npcData.id}`);
    }
    const npc = new Npc(npcData);
    this.npcs.set(npcData.id, npc);
  };

  @Export('removeNpc')
  private removeNpc = (id: string) => {
    const npc = this.getNpc(id);
    if (!npc) return;
    npc.delete();
    this.npcs.delete(id);
  };

  @Export('findPedData')
  private _getNpcData = (ped: number) => {
    const npc = Object.values(this.npcs).find(npc => npc.entity === ped);
    if (!npc) return;
    return npc.data;
  };

  @Export('setNpcState')
  private _setNpcState = (id: string, state: boolean) => {
    const npc = this.getNpc(id);
    if (!npc) return;
    npc.enabled = state;
  };

  public startThread = () => {
    setInterval(() => {
      const pos = Util.getPlyCoords();
      this.npcs.forEach(npc => {
        const distance = pos.distance(npc.data.position);
        if (distance <= npc.data.distance && npc.enabled && !npc.entity) {
          npc.spawn();
        }
        if (npc.entity && (distance > npc.data.distance || !npc.enabled)) {
          npc.delete(true);
        }
      });
    }, 500);
  };
}

const handler = Handler.getInstance();
export default handler;
