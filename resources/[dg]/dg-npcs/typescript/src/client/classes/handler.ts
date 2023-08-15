import { BaseEvents, Util, ExportDecorators } from '@dgx/client';
import { Npc } from './npc';

const { Export, ExportRegister } = ExportDecorators<'npcs'>();

@ExportRegister()
class Handler extends Util.Singleton<Handler>() {
  private npcs: Map<string, Npc> = new Map();

  constructor() {
    super();
    BaseEvents.onResourceStop(() => {
      this.npcs.forEach(npc => {
        npc.delete();
        npc.removeBlip();
      });
    });
  }

  private getNpc = (id: string) => {
    return this.npcs.get(id);
  };

  @Export('addNpc')
  addNpc(npcData: NPCs.NPC | NPCs.NPC[]) {
    if (Array.isArray(npcData)) {
      npcData.forEach(this.addNpc.bind(this));
      return;
    }
    // remove if already exists with id
    this.removeNpc(npcData.id);

    const npc = new Npc(npcData);
    this.npcs.set(npcData.id, npc);
  }

  @Export('removeNpc')
  public removeNpc(id: string | string[]) {
    if (Array.isArray(id)) {
      id.forEach(this.removeNpc.bind(this));
      return;
    }

    const npc = this.getNpc(id);
    if (!npc) return;

    npc.delete();
    npc.removeBlip();
    this.npcs.delete(id);
  }

  @Export('getPedData')
  private _getNpcData(ped: number) {
    const npc = [...this.npcs.values()].find(npc => npc.entity === ped);
    if (!npc) return;
    return npc.data;
  }

  @Export('setNpcEnabled')
  private _setNpcEnabled(id: string, enabled: boolean) {
    const npc = this.getNpc(id);
    if (!npc) return;
    npc.enabled = enabled;
  }

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
