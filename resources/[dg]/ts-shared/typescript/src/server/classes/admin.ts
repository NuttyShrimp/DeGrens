class Admin {
  hasPermission(source: number, role: string): boolean {
    return global.exports['dg-admin'].hasPlayerPermission(source, role);
  }
  isWhitelisted(source: number): Promise<boolean> {
    return global.exports['dg-admin'].isplayerwhitelisted(source);
  }
  isBanned(steamId: string): Promise<{ isBanned: boolean; reason: string }> {
    return global.exports['dg-admin'].isPlayerBanned(source);
  }
  ban(source: number, target: string | number, reason: string, points: number, length: number): Promise<void> {
    return global.exports['dg-admin'].ban(source, target, reason, points, length);
  }
  // Ban is given via anti-cheat and is permanent. Reason is prefixed with AntiCheat:
  ACBan(target: string | number, reason: string): Promise<void> {
    return global.exports['dg-admin'].ACBan(target, reason);
  }
  kick(source: number, target: string | number, reason: string, points: number): Promise<void> {
    return global.exports['dg-admin'].kick(source, target, reason, points);
  }
  warn(source: number, target: string | number, reason: string): Promise<void> {
    return global.exports['dg-admin'].warn(source, target, reason);
  }
}

export default {
  Admin: new Admin(),
};
