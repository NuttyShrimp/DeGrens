import { PropAttach } from '@dgx/client';
import { Util } from '@dgx/client';
import { Vector3 } from '@dgx/shared';
import { Export, ExportRegister } from '@dgx/shared';
import { DISABLED_KEYS_DURING_ANIMATION } from '../constants.objects';

@ExportRegister()
class ObjectsManager extends Util.Singleton<ObjectsManager>() {
  private config!: Objects.Config;
  private configLoaded = false;

  private readonly activeObjects: Map<string, Objects.Active>;
  private queues: Record<string | 'toggled', Objects.Item[]>; // Item queue per position
  private animationTimer: NodeJS.Timer | null = null;

  constructor() {
    super();
    this.activeObjects = new Map();
    this.queues = {
      toggled: [], // toggled is a special queue for manual overrides
    };
  }

  public setConfig = (config: Objects.Config) => {
    this.config = config;
    this.configLoaded = true;
  };

  public addedItem = async (item: Objects.Item) => {
    await Util.awaitCondition(() => this.configLoaded, 999999);

    const info = this.config.items[item.name];
    if (!info) return;

    if (this.isPositionFull(info.position)) {
      this.addToQueue(item, info.position);
      return;
    }

    let amountOfPosition = this.getActivesForPosition(info.position).length;
    let offset = Vector3.create(this.config.positions[info.position].offset).multiply(amountOfPosition);

    const propId = PropAttach.add(info.propName, offset);
    this.activeObjects.set(item.id, { ...item, propId });

    if (!!info.animData) this.startAnimation(info.animData.animDict, info.animData.anim);
  };

  public removedItem = (item: Objects.Item) => {
    const obj = this.activeObjects.get(item.id);

    // Do some checks if item is not active
    if (!obj) {
      // Check if in queue
      const data = this.findItemInQueue(item.id);
      if (data !== undefined) {
        this.queues[data.position].splice(data.index, 1);
        return;
      }

      console.error('Removed object item but was not active, queued or toggled');
      return;
    }

    this.activeObjects.delete(item.id);
    if (obj.propId !== null) {
      PropAttach.remove(obj.propId);
    }

    // move all other objs if secondary
    const info = this.config.items[obj.name];
    const positionConfig = this.config.positions[info.position];
    const activesForSamePosition = this.getActivesForPosition(info.position);
    activesForSamePosition.forEach((i, idx) => {
      if (i.propId === null) return;
      const offset = Vector3.create(positionConfig.offset).multiply(idx);
      PropAttach.move(i.propId, offset);
    });

    if (!!info.animData) this.stopAnimation(info.animData.animDict, info.animData.anim);

    this.checkQueue(info.position);
  };

  private addToQueue = (item: Objects.Item, queueName: string) => {
    let queue = this.queues[queueName];
    if (!queue) {
      queue = [];
      this.queues[queueName] = queue;
    }
    queue.push(item);
  };

  private checkQueue = (position: string) => {
    const unqueued = (this.queues[position] ?? []).shift();
    if (!unqueued) return;
    this.addedItem(unqueued);
  };

  private findItemInQueue = (itemId: string) => {
    for (const [position, objs] of Object.entries(this.queues)) {
      const index = objs.findIndex(i => i.id == itemId);
      if (index === -1) continue;
      return {
        position: position,
        index,
      };
    }
  };

  public toggleObject = (itemId: string, toggle: boolean) => {
    if (toggle) {
      const toggledIdx = (this.queues['toggled'] ?? []).findIndex(i => i.id === itemId);
      if (toggledIdx === -1) return;
      this.addedItem(this.queues['toggled'][toggledIdx]);
      this.queues['toggled'].splice(toggledIdx, 1);
    } else {
      const obj = this.activeObjects.get(itemId);
      if (!obj) return;
      const item = { id: itemId, name: obj.name };
      this.addToQueue(item, 'toggled');
      this.removedItem(item);
    }
  };

  public toggleAllObjects = (toggle: boolean) => {
    // We cache ids or we will get problems for modifying array while iterating over it
    let ids: string[];
    if (toggle) {
      ids = (this.queues['toggled'] ?? []).map(obj => obj.id);
    } else {
      ids = [...this.activeObjects.keys()];
    }
    ids.forEach(id => {
      this.toggleObject(id, toggle);
    });
  };

  @Export('hasObject')
  private _isAPrimaryActive = () => {
    return this.isPositionFull('primary');
  };

  private isPositionFull = (position: string) => {
    const positionConfig = this.config.positions[position];
    if (!positionConfig) throw new Error('Unknown position name for inventory object');

    const amount = this.getActivesForPosition(position).length;
    return amount >= positionConfig.max;
  };

  private getActivesForPosition = (position: string) => {
    const actives = [];
    for (const [_, obj] of this.activeObjects) {
      const info = this.config.items[obj.name];
      if (info.position === position) {
        actives.push(obj);
      }
    }
    return actives;
  };

  private startAnimation = async (animDict: string, anim: string) => {
    await Util.loadAnimDict(animDict);
    if (this.animationTimer !== null) {
      clearInterval(this.animationTimer);
    }
    this.animationTimer = setInterval(() => {
      DisablePlayerFiring(PlayerId(), true);

      DISABLED_KEYS_DURING_ANIMATION.forEach(key => {
        DisableControlAction(0, key, true);
      });

      const ped = PlayerPedId();
      if (IsEntityPlayingAnim(ped, animDict, anim, 3)) return;
      ClearPedTasksImmediately(ped);
      TaskPlayAnim(ped, animDict, anim, 8.0, 8.0, -1, 51, 0, false, false, false);
    }, 1);
  };

  private stopAnimation = (animDict: string, anim: string) => {
    if (this.animationTimer !== null) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }
    StopAnimTask(PlayerPedId(), animDict, anim, 1.0);
  };

  // Properly reset for switching chars
  public reset = (removeProps = false) => {
    if (removeProps) {
      for (const prop of this.activeObjects.values()) {
        if (prop.propId) {
          PropAttach.remove(prop.propId);
        }
      }
    }

    this.activeObjects.clear();
    this.queues = {};

    if (this.animationTimer !== null) {
      clearInterval(this.animationTimer);
      this.animationTimer = null;
    }
  };
}

const objectsManager = ObjectsManager.getInstance();
export default objectsManager;
