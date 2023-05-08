import { identifierManager } from './IdentifierManager';

class UserManager {
  private readonly userData = new Map<number, Core.Users.UserData>();

  getUserByIdentifier(identifier: string) {
    for (const [serverId, userData] of this.userData) {
      const identifiers = identifierManager.getIdentifiers(serverId);
      if (Object.values(identifiers).includes(identifier)) {
        return userData;
      }
    }
  }

  registerUser(src: number) {
    const identifiers = identifierManager.getIdentifiers(src);
    const userData: Core.Users.UserData = {
      serverId: src,
      name: GetPlayerName(String(src)),
      steamId: identifiers.steam,
    };
    this.userData.set(src, userData);
  }

  getUserData(src: number) {
    return this.userData.get(src);
  }
}

export const userManager = new UserManager();
