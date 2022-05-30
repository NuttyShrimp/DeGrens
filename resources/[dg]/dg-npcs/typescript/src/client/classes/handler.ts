import { Util } from '@dgx/client';
import { Export, ExportRegister } from '@dgx/shared/decorators';
import { Npc } from './npc';

@ExportRegister()
class Handler extends Util.Singleton<Handler>() {
  private npcs: Record<string, Npc> = {};
  private _active: boolean = false;
  private thread: NodeJS.Timer;

  get active() {
    return this._active;
  }

  set active(value: boolean) {
    this._active = value;
    if (!this.active) {
      clearInterval(this.thread);
    }
  }

  private getNpc = (id: string) => {
    if (!id) {
      throw new Error(`[NPCS] Tried to get NPC without providing id`);
    }
    return this.npcs[id];
  };

  constructor() {
    super();
    on('onResourceStop', (resourceName: string) => {
      if (GetCurrentResourceName() != resourceName) return;
      Object.entries(this.npcs).forEach(([_id, npc]) => {
        npc.delete();
      });
    });
  }

  initialize = (npcData: NpcData[]) => {
    npcData.forEach(data => {
      this.addNpc(data);
    });
    this.active = true;
    this.startThread();
  };

  @Export('addNpc')
  addNpc = (npcData: NpcData) => {
    if (this.getNpc(npcData.id)) {
      throw new Error(`[NPCS] Tried to add NPC with already registered id: ${npcData.id}`);
    }
    const npc = new Npc(npcData);
    this.npcs[npcData.id] = npc;
  };

  @Export('removeNpc')
  removeNpc = (id: string) => {
    const npc = this.getNpc(id);
    if (!npc) return;
    npc.delete();
    delete this.npcs[id];
  };

  @Export('setNpcState')
  setNpcState = (id: string, state: boolean) => {
    const npc = this.getNpc(id);
    if (!npc) return;
    npc.enabled = state;
  };

  startThread = () => {
    this.thread = setInterval(() => {
      const pos = Util.getPlyCoords();
      Object.entries(this.npcs).forEach(([id, npc]) => {
        const distance = pos.distance(npc.data.position);
        if (distance <= npc.data.distance && npc.enabled && !npc.entity) {
          npc.spawn();
        }
        if (npc.entity && (distance > npc.data.distance || !npc.enabled)) {
          npc.delete();
        }
      });
    }, 500);
  };
}

const handler = Handler.getInstance();
export default handler;
