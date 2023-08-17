import { Minigames, Notifications, Phone, Police, Sounds, SyncedObjects, Taskbar, Util } from '@dgx/server';
import { EventListener, DGXEvent } from '@dgx/server/src/decorators';
import heistManager from 'classes/heistmanager';
import config from 'services/config';
import { mainLogger } from 'sv_logger';
import winston from 'winston';

const HACK_PANEL_DATA: Objects.SyncedCreateData = {
  model: 'hei_prop_hei_securitypanel',
  coords: {
    x: -1303.2027,
    y: -816.5886,
    z: 17.5177,
  },
  rotation: {
    x: 0,
    y: 0,
    z: 307.1772,
  },
  flags: {
    mazeHackPanel: true,
  },
  skipStore: true,
};

@EventListener()
export class MazeManager implements Heists.TypeManager {
  private readonly logger: winston.Logger;

  private busyActions: Maze.BusyActions;
  private state: Maze.State;

  private emptyLocationTimeout: NodeJS.Timeout | null;

  constructor() {
    this.logger = mainLogger.child({ module: 'Mazebank' });

    this.busyActions = {
      panelHack: false,
    };
    this.state = {
      hacked: false,
      awaitingEmptyLocation: false,
    };

    this.emptyLocationTimeout = null;
  }

  public initialize = () => {
    SyncedObjects.add(HACK_PANEL_DATA);

    heistManager.onLocationEnter(locationId => {
      if (locationId !== 'maze') return;
      this.handleEnter();
    });

    heistManager.onLocationLeave(locationId => {
      if (locationId !== 'maze') return;
      this.handleLeave();
    });

    this.logger.info(`Loaded`);
  };

  @DGXEvent('heists:maze:hackPanel')
  private _hackPanel = async (plyId: number) => {
    if (heistManager.getIdOfLocationPlayerIsIn(plyId) !== 'maze') return;

    if (this.state.hacked || !Police.canDoActivity('heist_maze') || heistManager.isGlobalTimeoutActive()) {
      Notifications.add(plyId, 'Dit staat uit', 'error');
      return;
    }

    if (this.busyActions.panelHack) {
      Notifications.add(plyId, 'Iemand is hier al mee bezig', 'error');
      return;
    }
    this.busyActions.panelHack = true;

    const [canceled] = await Taskbar.create(plyId, 'usb-drive', 'Instellen', 10000, {
      canCancel: true,
      cancelOnDeath: true,
      cancelOnMove: true,
      disableInventory: true,
      disablePeek: true,
      disarm: true,
      controlDisables: {
        movement: true,
        carMovement: true,
        combat: true,
      },
      animation: {
        animDict: 'anim@heists@humane_labs@emp@hack_door',
        anim: 'hack_loop',
        flags: 1,
      },
    });
    if (canceled) {
      this.busyActions.panelHack = false;
      return;
    }

    const success = await Minigames.binarysudoku(plyId, config.maze.hack.gridSize, config.maze.hack.time);
    Sounds.playSuccessSoundFromCoord(HACK_PANEL_DATA.coords, success);

    if (!success) {
      Util.changePlayerStress(plyId, 20);
      this.busyActions.panelHack = false;
      return;
    }

    this.busyActions.panelHack = false;
    this.state.hacked = true;

    Phone.addMail(plyId, {
      subject: 'Openen Deur',
      sender: 'Hackermans',
      message: 'Ik doe er alles aan om zo snel mogelijk de deur te laten opengaan.',
    });

    const locationData = config.locations['maze'];
    Police.createDispatchCall({
      title: `Overval: ${locationData.label}`,
      blip: {
        sprite: 618,
        color: 1,
      },
      coords: { ...locationData.zone.points[0], z: 0 },
      entries: {
        'camera-cctv': locationData.cams.join(', '),
      },
      tag: '10-90',
      important: true,
    });

    setTimeout(
      () => {
        heistManager.startGlobalTimeout();
        heistManager.spawnTrolleysAtLocation('maze');
        heistManager.setLocationDoorState('maze', true);
      },
      (Util.isDevEnv() ? 3 : config.maze.doorOpenDelay) * 1000
    );

    this.state.awaitingEmptyLocation = true;

    const logMsg = `${Util.getName(plyId)}(${plyId}) has hacked the maze bank`;
    this.logger.info(logMsg);
    Util.Log('heists:maze:hack', {}, logMsg, plyId);
  };

  private handleEnter = () => {
    if (this.emptyLocationTimeout === null) return;
    clearTimeout(this.emptyLocationTimeout);
    this.emptyLocationTimeout = null;
  };

  private handleLeave = () => {
    if (!this.state.awaitingEmptyLocation) return;
    if (heistManager.getAmountOfPlayersInLocation('jewelry') > 0) return;

    if (this.emptyLocationTimeout) {
      clearTimeout(this.emptyLocationTimeout);
    }

    this.emptyLocationTimeout = setTimeout(
      () => {
        this.emptyLocationTimeout = null;
        this.state.awaitingEmptyLocation = false;
        this.startResetTimeout();
      },
      Util.isDevEnv() ? 0 : config.maze.emptyLocationTimeForReset * 60 * 1000
    );
  };

  private startResetTimeout = () => {
    const logMsg = `mazebank reset has been started`;
    this.logger.info(logMsg);
    Util.Log('heists:maze:startReset', {}, logMsg);

    setTimeout(
      () => {
        this.state.hacked = false;
        heistManager.setLocationDoorState('maze', false);

        const logMsg = `mazebank has been reset`;
        this.logger.info(logMsg);
        Util.Log('heists:maze:reset', {}, logMsg);
      },
      (Util.isDevEnv() ? 1 : config.maze.resetTime) * 60 * 1000
    );
  };
}
