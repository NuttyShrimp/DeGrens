import { queueManager } from './managers/queuemanager';
import { getModule } from '../../moduleController';
import { Admin, Util } from '@dgx/server';
import { userManager } from 'modules/users/managers/userManager';
import winston from 'winston';
import { mainLogger } from 'sv_logger';
import { generateQueueCard } from './util.queue';

export class QueueModule implements Modules.ServerModule, Core.ServerModules.QueueModule {
  private manager = queueManager;
  private logger: winston.Logger;

  constructor() {
    this.logger = mainLogger.child({
      module: 'QUEUE',
    });
  }

  getQueue = () => {
    return queueManager.getQueuedPlayers();
  };

  onStart() {
    this.manager.loadDBPower();
  }

  onPlayerJoined = async (src: number, oldSource: number) => {
    this.manager.finishQueue(src, oldSource);
  };

  onPlayerDropped = async (src: number, _reason: string) => {
    const userModule = getModule('users');
    const identifiers = userModule.getPlyIdentifiers(src);
    const steamId = identifiers.steam;
    if (!steamId) {
      this.logger.warn(
        `Failed to to get steamid for ${src}: ${Object.keys(identifiers).map(k => `${k}: ${identifiers[k]}`)}`
      );
      return;
    }
    if (!this.manager.isInQueue(steamId)) return;
  };

  onPlayerJoining = async (
    src: number,
    name: string,
    setKickReason: (reason: string) => void,
    deferrals: Record<string, any>
  ) => {
    await deferrals.defer();
    const userModule = getModule('users');
    const plyIdentifiers = userModule.getPlyIdentifiers(src);
    const showCard = generateQueueCard(deferrals);

    showCard(`Welcome ${name}!, Validating your Rockstar license`);
    const rockstarLicense = plyIdentifiers.license;
    if (!rockstarLicense) {
      deferrals.done('No valid rockstar license found');
      return;
    }

    showCard(`Welcome ${name}!, Validating your steam ID`);
    const steamId = plyIdentifiers.steam;
    if (!steamId) {
      deferrals.done('No valid steam account found');
      return;
    }

    showCard(`Welcome ${name}!, Validating your discord ID`);
    if (!plyIdentifiers.discord) {
      deferrals.done('No valid discord account found\nPress CTRL+R in discord and restart your fivem afterwards');
      return;
    }

    showCard(`Welcome ${name}!, Checking your ban status`);
    const banInfo = await Admin.isBanned(steamId);
    if (banInfo.isBanned) {
      deferrals.done(banInfo.reason);
      return;
    }

    if (!Util.isDevEnv()) {
      showCard(`Welcome ${name}!, checking for duplicated identifiers`);
      let user = userManager.getUserByIdentifier(steamId);
      if (user) {
        deferrals.done('We already have an active player with this steamId');
        return;
      }
      user = userManager.getUserByIdentifier(rockstarLicense);
      if (user) {
        deferrals.done('We already have an active player with this Rockstar License');
        return;
      }
    }

    showCard(`Welcome ${name}!, checking your allowlist status`);
    const whitelisted = await Admin.isWhitelisted(src);
    if (!whitelisted) {
      deferrals.done(
        "It seems like you'r not allowlisted for this server.\nAre your steam and discord open?\nTry restarting your fiveM client and try again"
      );
      return;
    }
    setTimeout(() => {
      queueManager.joinQueue(src, name, steamId, deferrals);
    }, 10000);
  };
}
