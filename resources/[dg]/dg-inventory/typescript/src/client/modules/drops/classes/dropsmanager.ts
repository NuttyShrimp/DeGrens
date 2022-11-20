import { RPC, Util } from '@dgx/client';

class DropsManager extends Util.Singleton<DropsManager>() {
  private drops: Map<string, Vec3>;
  private markersToShow: Vec3[] = [];
  private drawThread: NodeJS.Timer | null;
  private range: number;

  constructor() {
    super();
    this.drops = new Map();
    this.markersToShow = [];
    this.drawThread = null;
    this.range = 0;
  }

  public load = async () => {
    const drops = await RPC.execute<[string, Vec3][]>('inventory:server:getDrops');
    if (!drops) return;
    this.drops = new Map(drops);
    const range = await RPC.execute<number>('inventory:server:getDropRange');
    if (!range) return;
    this.range = range * 8;
    this.checkCloseDrops();
  };

  public add = (id: string, coords: Vec3) => {
    this.drops.set(id, coords);
  };

  public remove = (id: string) => {
    const success = this.drops.delete(id);
    if (!success) {
      console.error(`Tried to remove drop ${id} which was not known to client`);
    }
  };

  private checkCloseDrops = () => {
    this.markersToShow = [];
    const plyPos = Util.getPlyCoords();
    this.drops.forEach(coords => {
      if (plyPos.distance(coords) > this.range) return;
      this.markersToShow.push(coords);
    });

    // if no drops close, stop drawthread
    // else start thread if it wasnt already running
    if (this.markersToShow.length === 0) {
      this.clearDrawLoop();
    } else {
      if (this.drawThread === null) {
        this.startDrawLoop();
      }
    }

    setTimeout(() => {
      this.checkCloseDrops();
    }, 500);
  };

  private startDrawLoop = () => {
    this.drawThread = setInterval(() => {
      for (let i = 0; i < this.markersToShow.length; i++) {
        const coords = this.markersToShow[i];
        DrawMarker(
          2,
          coords.x,
          coords.y,
          coords.z - 0.55,
          0.0,
          0.0,
          0.0,
          0.0,
          0.0,
          0.0,
          0.25,
          0.25,
          0.2,
          118,
          127,
          207,
          100,
          false,
          false,
          0,
          true,
          // @ts-ignore
          undefined,
          // @ts-ignore
          undefined,
          false
        );
      }
    }, 1);
  };

  private clearDrawLoop = () => {
    if (this.drawThread === null) return;
    clearInterval(this.drawThread);
    this.drawThread = null;
  };
}

const dropsManager = DropsManager.getInstance();
export default dropsManager;
