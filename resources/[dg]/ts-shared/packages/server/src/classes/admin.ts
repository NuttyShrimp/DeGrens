class Admin {
  hasPermission(source: number, role: string): boolean {
    return global.exports['dg-admin'].hasPlayerPermission(source, role);
  }
  canPlayerBeAFK(source: number): boolean {
    return global.exports['dg-admin'].canPlayerBeAFK(source);
  }
  hasSteamIdPermission(steamId: string, role: string): boolean {
    return global.exports['dg-admin'].hasSteamIdPermission(steamId, role);
  }
  isWhitelisted(source: number): Promise<boolean> {
    return global.exports['dg-admin'].isPlayerWhitelisted(source);
  }
  isBanned(steamId: string): Promise<{ isBanned: boolean; reason: string }> {
    return global.exports['dg-admin'].isPlayerBanned(steamId);
  }
  ban(source: number, target: string | number, reason: string[], points: number, length: number): Promise<void> {
    return global.exports['dg-admin'].ban(source, target, reason, points, length);
  }
  // Ban is given via anti-cheat and is permanent. Reason is prefixed with AntiCheat:
  ACBan(target: string | number, reason: string, data?: Record<string, any>): Promise<void> {
    return global.exports['dg-admin'].ACBan(target, reason, data);
  }
  kick(source: number, target: string | number, reason: string[], points: number): Promise<void> {
    return global.exports['dg-admin'].kick(source, target, reason, points);
  }
  warn(source: number, target: string | number, reason: string[], points = 0): Promise<void> {
    return global.exports['dg-admin'].warn(source, target, reason, points);
  }
  isInDevMode(src: number): boolean {
    return global.exports['dg-admin'].isInDevMode(src);
  }
  plyInDevMode(): number[] {
    return global.exports['dg-admin'].plyInDevMode();
  }
  getHiddenPlys(): number[] {
    return global.exports['dg-admin'].getHiddenPlys();
  }
}

export default {
  Admin: new Admin(),
};
