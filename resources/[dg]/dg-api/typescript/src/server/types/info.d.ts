declare namespace APIInfo {
  type PlayerRole = 'developer' | 'staff' | 'police' | 'ambulance';
  type PlayerRoles = Record<PlayerRole, boolean>;
}
