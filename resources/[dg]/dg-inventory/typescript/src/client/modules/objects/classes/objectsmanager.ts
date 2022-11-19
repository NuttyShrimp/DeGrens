import { PropAttach } from '@dgx/client';
import { Util } from '@dgx/client';
import { Export, ExportRegister } from '@dgx/shared/decorators';

@ExportRegister()
class ObjectsManager extends Util.Singleton<ObjectsManager>() {
  private readonly activeObjects: Map<string, { propId: number; info: Objects.Info }>;
  private readonly queue: {
    primary: Objects.Obj[];
    secondary: Objects.Obj[];
  };
  private animationTimer: NodeJS.Timer | null = null;

  private readonly SECONDARY_OFFSET = -0.09;
  private readonly SECONDARY_MAX = 4;

  private toggledObj: Objects.Obj | null;

  private secondaryAmount = 0;
  private primaryActive: boolean;

  constructor() {
    super();
    this.activeObjects = new Map();
    this.queue = { primary: [], secondary: [] };
    this.toggledObj = null;
    this.secondaryAmount = 0;
    this.primaryActive = false;
  }

  public addedItem = async (itemId: string, info: Objects.Info) => {
    if (this.canAddItem(info.type)) {
      this.queue[info.type].push({ itemId, info });
      return;
    }

    if (info.type === 'primary') {
      this.primaryActive = true;
    }

    let offset = { x: 0, y: 0, z: 0 };
    if (info.type === 'secondary') {
      offset = { x: 0, y: 0, z: this.SECONDARY_OFFSET * this.secondaryAmount };
      this.secondaryAmount++;
    }

    const propId = await PropAttach.add(info.name, offset);
    if (propId === undefined) {
      throw new Error('Failed to create prop for item');
    }
    this.activeObjects.set(itemId, { info, propId });

    if (!!info.animData) this.startAnimation(info.animData.animDict, info.animData.anim);
  };

  public removedItem = (itemId: string) => {
    const obj = this.activeObjects.get(itemId);
    if (!obj) {
      const data = this.getObjOfIdInQueue(itemId);
      if (!data) {
        if (this.toggledObj?.itemId == itemId) {
          this.toggledObj = null;
          return;
        }
        return;
      }
      this.queue[data.type].splice(data.index, 1);
      return;
    }

    this.activeObjects.delete(itemId);
    PropAttach.remove(obj.propId);

    // Set to false if this was primary
    if (obj.info.type === 'primary') {
      this.primaryActive = false;
    }

    // move all other objs if secondary
    if (obj.info.type === 'secondary') {
      this.secondaryAmount--;
      this.getSecondaries().forEach((obj, index) => {
        const offset = { x: 0, y: 0, z: this.SECONDARY_OFFSET * index };
        PropAttach.move(obj.propId, offset);
      });
    }

    if (!!obj.info.animData) this.stopAnimation(obj.info.animData.animDict, obj.info.animData.anim);

    this.checkQueue(obj.info.type);
  };

  @Export('toggleObject')
  public toggleObject = (itemId: string, toggle: boolean) => {
    if (toggle) {
      if (!this.toggledObj) return;
      this.addedItem(this.toggledObj.itemId, this.toggledObj.info);
      this.toggledObj = null;
    } else {
      const obj = this.activeObjects.get(itemId);
      if (!obj) return;
      this.toggledObj = { itemId, info: obj.info };
      this.removedItem(itemId);
    }
  };

  private checkQueue = (type: keyof typeof this.queue) => {
    const unqueued = this.queue[type].shift();
    if (!unqueued) return;
    this.addedItem(unqueued.itemId, unqueued.info);
  };

  @Export('hasObject')
  private isAPrimaryActive = () => {
    return this.primaryActive;
  };

  private getSecondaries = () => {
    return [...this.activeObjects.values()].filter(obj => obj.info.type === 'secondary');
  };

  private canAddItem = (type: string) => {
    return (
      (type === 'primary' && this.isAPrimaryActive()) ||
      (type === 'secondary' && this.secondaryAmount === this.SECONDARY_MAX)
    );
  };

  private getObjOfIdInQueue = (itemId: string) => {
    for (const [type, objs] of Object.entries(this.queue)) {
      const index = objs.findIndex(i => i.itemId == itemId);
      if (index !== -1) {
        return {
          type: type as keyof typeof this.queue,
          index,
        };
      }
    }
  };

  private startAnimation = (animDict: string, anim: string) => {
    setImmediate(async () => {
      await Util.loadAnimDict(animDict);
      const ped = PlayerPedId();
      TaskPlayAnim(ped, animDict, anim, 8.0, 2.0, -1, 51, 0, false, false, false); // avoid setinterval initial delay
      if (this.animationTimer !== null) {
        clearInterval(this.animationTimer);
      }
      this.animationTimer = setInterval(() => {
        if (IsEntityPlayingAnim(ped, animDict, anim, 3)) return;
        TaskPlayAnim(ped, animDict, anim, 8.0, 2.0, -1, 51, 0, false, false, false);
      }, 250);
    });
  };

  private stopAnimation = (animDict: string, anim: string) => {
    if (this.animationTimer !== null) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }
    StopAnimTask(PlayerPedId(), animDict, anim, 1.0);
  };

  // Properly reset for switching chars
  public reset = () => {
    [...this.activeObjects.values()].forEach(obj => {
      PropAttach.remove(obj.propId);
    });

    this.activeObjects.clear();
    this.queue.primary = [];
    this.queue.secondary = [];
    this.toggledObj = null;
    this.secondaryAmount = 0;
    this.primaryActive = false;

    if (this.animationTimer !== null) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }
  };
}

const objectsManager = ObjectsManager.getInstance();
export default objectsManager;
