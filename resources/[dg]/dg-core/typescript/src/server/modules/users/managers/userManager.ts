import { identifierManager } from './IdentifierManager';

class UserManager {
  private readonly onlineUsers = new Set<number>(); // online ply ids
  private readonly names = new Map<number, string>(); // serverId to names of all players who joined since restart

  getUserByIdentifier(identifier: string) {
    for (const serverId of this.onlineUsers) {
      const identifiers = identifierManager.getIdentifiers(serverId);
      if (Object.values(identifiers).includes(identifier)) {
        return serverId;
      }
    }
  }

  registerUser(src: number) {
    this.onlineUsers.add(src);
    this.names.set(src, GetPlayerName(String(src)));
  }

  removeUser(src: number) {
    this.onlineUsers.delete(src);
  }

  getUserName(src: number) {
    return this.names.get(src);
  }
}

export const userManager = new UserManager();
