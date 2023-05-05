import { SQL } from '@dgx/server';
import { identifierManager } from './managers/IdentifierManager';
import { userManager } from './managers/userManager';
import { mainLogger } from '../../sv_logger';
import winston from 'winston';

export class UserModule implements Modules.ServerModule, Core.ServerModules.UserModule {
  private identifierManager = identifierManager;
  private userManager = userManager;
  private logger: winston.Logger;

  constructor() {
    this.logger = mainLogger.child({ module: 'users' });
  }

  onStart() {
    // Load identifiers for all joined players
  }

  onPlayerJoining(src: number) {
    this.identifierManager.loadIdentifiers(src);
    this.userManager.registerUser(src);
  }

  onPlayerJoined(src: number, oldSrc: number) {
    this.identifierManager.moveIdentifiers(oldSrc, src);
    userManager.registerUser(src);
  }

  getPlyIdentifiers = (src: number) => this.identifierManager.getIdentifiers(src);

  getServerIdFromIdentifier = (key: string, identifier: string) =>
    this.identifierManager.getServerIdFromIdentifier(key, identifier);

  saveUser = async (src: number) => {
    const identifiers = this.getPlyIdentifiers(src);
    const userData = this.userManager.getUserData(src);
    if (!userData) {
      this.logger.warn(`Tried to save user data for ${src} but no user data was found`);
      return;
    }
    const localResult = await SQL.query(
      `
        INSERT INTO users (name, steamid, license, discord)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE name         = VALUES(name),
                                steamid      = VALUES(steamid),
                                license      = VALUES(license),
                                discord      = VALUES(discord),
                                last_updated = NOW()
      `,
      [userData.name, identifiers.steam, identifiers.fivem, identifiers.discord]
    );
    if (localResult.affectedRows === 0) {
      this.logger.warn(`Failed to save user data for ${userData.name}(${src})`);
    }
  };
}
