import { SQL, Util } from '@dgx/server';
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
    for (const src of Util.getAllPlayers()) {
      this.identifierManager.loadIdentifiers(src);
      this.userManager.registerUser(src);
    }
  }

  onPlayerJoining(src: number) {
    this.identifierManager.loadIdentifiers(src);
    // if we register user here, we wouldnt be able to join because queue module would think someone with same identifiers is already in server
  }

  onPlayerJoined(src: number, oldSrc: number) {
    this.identifierManager.moveIdentifiers(oldSrc, src);
    this.userManager.registerUser(src);
  }

  onPlayerDropped(src: number) {
    this.userManager.removeUser(src);
    this.identifierManager.removeIdentifiers(src);
  }

  getPlyIdentifiers = (src: number) => this.identifierManager.getIdentifiers(src);

  getServerIdFromIdentifier = (key: string, identifier: string) =>
    this.identifierManager.getServerIdFromIdentifier(key, identifier);

  saveUser = async (src: number) => {
    const identifiers = this.getPlyIdentifiers(src);
    const userName = this.userManager.getUserName(src);
    if (!userName) {
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
      [userName, identifiers.steam, identifiers.license, identifiers.discord]
    );
    if (localResult.affectedRows === 0) {
      this.logger.warn(`Failed to save user data for ${userName}(${src})`);
    }
  };
}
