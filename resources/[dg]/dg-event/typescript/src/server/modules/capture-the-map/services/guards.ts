import { Events, Npcs, Util } from '@dgx/server';
import { Vector3 } from '@dgx/shared';
import { ZONE_INFO } from '@shared/data/zones';

import { PED_MODELS } from '../constant';
import { ctmLogger } from '../logger';

import { gainXP } from './xpSystem';
import { getMafiaZones } from './zones';

let guardThread: NodeJS.Timeout;
// sizes.zones are the chances of that zone idx being picked
const areaSizes: Record<string, { total: number; zones: number[] }> = {};
const guards: Record<string, number[]> = {};

const scheduleGuardThread = async () => {
  const mafiaZones = getMafiaZones();
  // add 1 guard for every 100 square meters
  for (const zone in mafiaZones) {
    const zoneInfo = ZONE_INFO.find(z => z.name === zone);
    if (!zoneInfo) continue;

    if (!(zone in guards)) guards[zone] = [];

    // Cleanup exisiting guards
    for (const guard of guards[zone]) {
      if (DoesEntityExist(guard)) continue;
      const idx = guards[zone].findIndex(g => g === guard);
      if (idx) {
        guards[zone].splice(idx);
      }
    }

    const area = areaSizes[zone].total;
    const numGuards = Math.floor(area / 50000) - guards[zone].length;
    ctmLogger.debug(`Spawning ${numGuards} guards for zone ${zone}`);
    for (let i = 0; i < numGuards; i++) {
      const locGamba = Math.random();
      const locIdx = Math.max(0, areaSizes[zone].zones.findIndex(c => c > locGamba) - 1);
      const loc = zoneInfo.blipLocations[locIdx];
      const ped = await Npcs.spawnGuard({
        model: PED_MODELS[Math.floor(Math.random() * PED_MODELS.length)],
        position: Vector3.add(
          loc.coords,
          new Vector3(
            Util.getRndDecimal(-loc.width / 2, loc.width / 2),
            Util.getRndDecimal(-loc.height / 2, loc.height / 2),
            0
          )
        ),
        weapon: Util.getRndInteger(0, 4) >= 3 ? 'WEAPON_GUSENBERG' : 'WEAPON_PISTOL',
        deleteTime: {
          alive: 60 * 60 * 1000,
        },
        flags: {
          ctmPed: true,
        },
        onDeath: srvId => {
          if (!srvId || srvId < 1) return;
          gainXP(Util.getCID(srvId));
        },
      });
      guards[zone].push(ped);
      let target: Vector3 | undefined = undefined;
      let distance: number = Number.MAX_VALUE;
      // Find nearest not mafia zone
      for (const zone in ZONE_INFO) {
        if (zone in mafiaZones) continue;
        if (target === undefined) {
          target = Vector3.create(ZONE_INFO[zone].origin);
        } else if (target.distance(ZONE_INFO[zone].origin) < distance) {
          distance = target.distance(ZONE_INFO[zone].origin);
          target = Vector3.create(ZONE_INFO[zone].origin);
        }
      }
      if (!target) {
        ctmLogger.error('Failed to find target for guard');
        continue;
      }
      TaskGoStraightToCoord(ped, target.x, target.y, target.z, 1.0, -1, 0, 0.1);
    }
  }
  Events.emitNet(
    'events:ctm:guards:sync',
    -1,
    Object.values(guards).flatMap(g => g.map(g => NetworkGetNetworkIdFromEntity(g)))
  );
  guardThread = setTimeout(async () => {
    scheduleGuardThread();
  }, 60000);
};

export const startGuardThread = () => {
  if (guardThread) return;

  for (const zone of ZONE_INFO) {
    let area = 0;
    const zoneSizes: number[] = [];
    for (const blip of zone.blipLocations) {
      const zoneSize = blip.width * blip.height;
      zoneSizes.push(zoneSize);
      area += zoneSize;
    }
    areaSizes[zone.name] = {
      total: area,
      zones: zoneSizes.reduce((s, v) => {
        s.push(v / area + s.reduce((a, v) => a + v, 0));
        return s;
      }, new Array<number>(0)),
    };
  }
  scheduleGuardThread();
};
