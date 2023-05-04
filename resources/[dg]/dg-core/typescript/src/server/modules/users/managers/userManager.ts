import { identifierManager } from "./IdentifierManager";

class UserManager {
  private userData: Core.Users.UserData[] = [];

  getUserByIdentifier(identifier: string) {
    return this.userData.find(u => {
      const identifiers = identifierManager.getIdentifiers(u.serverId);
      return Object.values(identifiers).includes(identifier);
    });
  }

  registerUser(src: number) {
    const identifiers = identifierManager.getIdentifiers(src);
    const userData: Core.Users.UserData = {
      serverId: src,
      name: GetPlayerName(String(src)),
      steamId: identifiers.steam,
    };
    this.userData.push(userData);
  }

  getUserData(src: number) {
    return this.userData.find(u => u.serverId === src);
  }
}

export const userManager = new UserManager();
