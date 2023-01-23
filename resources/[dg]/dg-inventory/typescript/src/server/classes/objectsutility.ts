import { Config, Events } from '@dgx/server';
import { DGXEvent, EventListener, Export, ExportRegister, RPCRegister } from '@dgx/server/decorators';
import { Util } from '@dgx/shared';

@RPCRegister()
@EventListener()
@ExportRegister()
class ObjectsUtility extends Util.Singleton<ObjectsUtility>() {
  private _config: Objects.Config | null = null;

  public get config() {
    return this._config;
  }
  private set config(val: typeof this._config) {
    this._config = val;
  }

  constructor() {
    super();
    this.loadConfig();
  }

  private async loadConfig() {
    await Config.awaitConfigLoad();
    this.config = Config.getConfigValue('inventory.objects');
  }

  public dispatchConfigToPlayer = async (plyId: number) => {
    await Util.awaitCondition(() => this.config !== null);
    Events.emitNet('inventory:objects:setConfig', plyId, this.config);
  };

  @Export('toggleObject')
  @DGXEvent('inventory:objects:toggle')
  private _toggleObject(src: number, itemId: string, toggle: boolean) {
    Events.emitNet('inventory:objects:toggle', src, itemId, toggle);
  }

  @Export('toggleAllObjects')
  @DGXEvent('inventory:objects:toggleAll')
  private _toggleAllObjects(src: number, toggle: boolean) {
    Events.emitNet('inventory:objects:toggleAll', src, toggle);
  }
}

const objectsUtility = ObjectsUtility.getInstance();
export default objectsUtility;
