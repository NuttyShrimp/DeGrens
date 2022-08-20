import { RPC, Util } from '@dgx/client';

class DropsManager extends Util.Singleton<DropsManager>() {
  private drops: Vec3[];
  private closeDrops: Vec3[] = [];

  constructor() {
    super();
    this.drops = [];
    this.closeDrops = [];
  }

  public load = async () => {
    const drops = await RPC.execute<Vec3[]>('inventory:server:getDrops');
    if (!drops) return;
    this.drops = drops;
    let range = await RPC.execute<number>('inventory:server:getDropRange');
    if (!range) return;
    range *= 8;
    this.checkCloseDrops(range);
    this.showDropsLoop(range);
  };

  public add = (drop: Vec3) => {
    this.drops.push(drop);
  };

  public remove = (drop: Vec3) => {
    const index = this.drops.findIndex(d => d.x === drop.x && d.y === drop.y && d.z === drop.z);
    this.drops.splice(index, 1);
  };

  private checkCloseDrops = (range: number) => {
    setInterval(() => {
      this.closeDrops = [];
      const plyPos = Util.getPlyCoords();
      this.drops.forEach(drop => {
        if (plyPos.distance(drop) > range) return;
        this.closeDrops.push(drop);
      });
    }, 500);
  };

  private showDropsLoop = (range: number) => {
    setInterval(() => {
      this.closeDrops.forEach(drop =>
        DrawMarker(
          2,
          drop.x,
          drop.y,
          drop.z - 0.2,
          0.0,
          0.0,
          0.0,
          0.0,
          0.0,
          0.0,
          0.2,
          0.2,
          0.15,
          118,
          127,
          207,
          100,
          false,
          false,
          0,
          true,
          '',
          '',
          false
        )
      );
    }, 1);
  };
}

const dropsManager = DropsManager.getInstance();
export default dropsManager;
