import { queueManager } from './managers/queuemanager';
import { getModule } from '../../moduleController';
import { Admin, Util } from '@dgx/server';
import { userManager } from 'modules/users/managers/userManager';
import winston from 'winston';
import { mainLogger } from 'sv_logger';

export class QueueModule implements Modules.ServerModule, Core.ServerModules.QueueModule {
  private manager = queueManager;
  private logger: winston.Logger;

  constructor() {
    this.logger = mainLogger.child({
      module: 'QUEUE',
    });
  }

  getQueue() {
    return queueManager.getQueuedPlayers();
  }

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
    const finishDeferrals = (msg: string) => {
      deferrals.presentCard(
        JSON.stringify({
          type: 'AdaptiveCard',
          body: [
            {
              type: 'TextBlock',
              text: msg,
              wrap: true,
            },
          ],
          actions: [
            {
              type: 'Action.OpenUrl',
              title: 'Join our discord!',
              url: 'https://discord.degrensrp.be',
            },
          ],
          $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
          version: '1.5',
        })
      );
    };

    deferrals.update(`Welcome ${name}!, Validating your Rockstar license`);
    const rockstarLicense = plyIdentifiers.license;
    if (!rockstarLicense) {
      finishDeferrals('No valid rockstar license found');
      return;
    }

    deferrals.update(`Welcome ${name}!, Validating your steam ID`);
    const steamId = plyIdentifiers.steam;
    if (!steamId) {
      finishDeferrals('No valid steam account found');
      return;
    }

    deferrals.update(`Welcome ${name}!, Validating your discord ID`);
    if (!plyIdentifiers.discord) {
      finishDeferrals('No valid discord account found\nPress CTRL+R in discord and restart your fivem afterwards');
      return;
    }

    deferrals.update(`Welcome ${name}!, Checking your ban status`);
    const banInfo = await Admin.isBanned(steamId);
    if (banInfo.isBanned) {
      finishDeferrals(banInfo.reason);
      return;
    }

    if (!Util.isDevEnv()) {
      deferrals.update(`Welcome ${name}!, checking for duplicated identifiers`);
      let user = userManager.getUserByIdentifier(steamId);
      if (user) {
        finishDeferrals('We already have an active player with this steamId');
        return;
      }
      user = userManager.getUserByIdentifier(rockstarLicense);
      if (user) {
        finishDeferrals('We already have an active player with this Rockstar License');
        return;
      }
    }

    deferrals.update(`Welcome ${name}!, checking your allowlist status`);
    const whitelisted = await Admin.isWhitelisted(src);
    if (!whitelisted) {
      finishDeferrals(
        "It seems like you'r not allowlisted for this server.\nAre your steam and discord open?\nTry restarting your fiveM client and try again"
      );
      return;
    }
    queueManager.joinQueue(src, name, steamId, deferrals);
  };
}
