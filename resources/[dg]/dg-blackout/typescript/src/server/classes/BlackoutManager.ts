import { Chat, Events, Police, Util } from '@dgx/server';
import config from '../services/config';
import { mainLogger } from 'sv_logger';
import winston from 'winston';
import { EventListener, DGXEvent } from '@dgx/server/src/decorators';

@EventListener()
class BlackoutManager extends Util.Singleton<BlackoutManager>() {
  private readonly logger: winston.Logger;

  private blackoutState: boolean;
  private safezonesActive: boolean;
  private readonly hitPowerstations: Set<number>;

  private readonly playersAtLocation: Record<Blackout.LocationType, Map<number, string>>;

  private safezoneActivationTimeout: NodeJS.Timeout | null = null;
  private flickeringThread: NodeJS.Timer | null = null;

  constructor() {
    super();
    this.logger = mainLogger.child({ module: 'BlackoutManager' });

    this.blackoutState = false;
    this.safezonesActive = false;
    this.hitPowerstations = new Set();
    this.playersAtLocation = {
      powerstation: new Map(),
      safezone: new Map(),
    };
  }

  public initiate = () => {
    this.updateStatebag();
    this.logger.info('Initiated');
  };

  public getBlackoutState = () => this.blackoutState;

  public setBlackoutState = (state: boolean, plyId?: number) => {
    if (state === this.blackoutState) return;

    this.blackoutState = state;
    this.safezonesActive = false;

    if (this.safezoneActivationTimeout) {
      clearTimeout(this.safezoneActivationTimeout);
      this.safezoneActivationTimeout = null;
    }

    this.clearFlickeringThread();
    this.updateStatebag();
    Chat.sendMessage(-1, {
      prefix: 'DG Departement Energie: ',
      message: this.blackoutState
        ? 'We onderzoeken de oorzaak van de actuele stroompanne.'
        : 'De stroompanne is opgelost. Excuses voor het ongemak.',
      type: 'system',
    });

    if (this.blackoutState) {
      this.safezoneActivationTimeout = setTimeout(() => {
        this.logger.debug('Activating safezones');
        this.safezonesActive = true;
        this.updateStatebag();
        this.startFlickeringThread();
      }, config.safezoneDelay * 1000);
    }

    const logMsg = `Blackout state set to ${this.blackoutState}${plyId ? ` by ${Util.getName(plyId)}(${plyId})` : ''}`;
    this.logger.info(logMsg);
    Util.Log('blackout:stateChange', { state: this.blackoutState }, logMsg, plyId);
  };

  public updateStatebag = () => {
    GlobalState.blackoutState = {
      blackout: this.blackoutState,
      safezones: this.safezonesActive,
    } satisfies Blackout.Statebag;
  };

  private startFlickeringThread = () => {
    this.clearFlickeringThread();

    this.flickeringThread = setInterval(() => {
      if (Util.getRndInteger(1, 100) > 20) return;

      this.playersAtLocation.safezone.forEach((_, ply) => {
        emitNet('blackout:flicker', ply);
      });
    }, 1000);
  };

  private clearFlickeringThread = () => {
    if (this.flickeringThread === null) return;
    clearInterval(this.flickeringThread);
    this.flickeringThread = null;
  };

  public isPowerStationHit = (id: number | string) => {
    return this.hitPowerstations.has(Number(id));
  };

  @DGXEvent('blackout:powerstation:setHit')
  private _setPowerStationHit = (plyId: number, powerstationId: number) => {
    const powerstationConfig = config.powerstations[powerstationId];
    if (!powerstationConfig) return;

    this.hitPowerstations.add(powerstationId);
    this.checkIfAllStationsAreHit();

    Police.createDispatchCall({
      tag: '10-35',
      title: 'Verdachte activiteit aan een elektriciteits centrale',
      description:
        'Er is een luide explosie gehoord rond de elektriciteits centrale. Er word om dringende assistentie gevraagd!',
      coords: powerstationConfig.center,
      entries: {
        'camera-cctv': powerstationConfig.camId,
      },
      criminal: plyId,
      blip: {
        sprite: 354,
        color: 5,
      },
      important: true,
    });

    const logMsg = `${Util.getName(plyId)}(${plyId}) has hit powerstation ${powerstationId}`;
    this.logger.info(logMsg);
    Util.Log('blackout:powerstationHit', { powerstationId }, logMsg, plyId);
  };

  private checkIfAllStationsAreHit = () => {
    if (this.blackoutState) return;
    if (this.hitPowerstations.size < config.powerstations.length) return;

    blackoutManager.setBlackoutState(true);
    setTimeout(
      () => {
        blackoutManager.setBlackoutState(false);
      },
      config.duration * 60 * 1000
    );
  };

  @DGXEvent('blackout:server:setAtLocation')
  private _setPlayerAtLocation = (
    plyId: number,
    locationType: Blackout.LocationType,
    locationId: string,
    atLocation: boolean
  ) => {
    const location = this.playersAtLocation[locationType];
    if (!location) {
      this.logger.error(`Invalid location type ${locationType}`);
      return;
    }

    if (atLocation) {
      location.set(plyId, String(locationId));
      this.logger.debug(`Player ${plyId} is at ${locationType} ${locationId}`);
    } else {
      location.delete(plyId);
      this.logger.debug(`Player ${plyId} left ${locationType} ${locationId}`);
    }
  };

  public getLocationPlayerIsAt = (plyId: number): { powerstationId: string } | { safezoneId: string } | undefined => {
    for (const [locationType, playersAtLocation] of Object.entries(this.playersAtLocation)) {
      const location = playersAtLocation.get(plyId);
      if (!location) continue;

      switch (locationType as Blackout.LocationType) {
        case 'powerstation':
          return { powerstationId: location };
        case 'safezone':
          return { safezoneId: location };
        default:
          throw new Error(`Invalid location type ${locationType}`);
      }
    }
  };
}

const blackoutManager = BlackoutManager.getInstance();
export default blackoutManager;
