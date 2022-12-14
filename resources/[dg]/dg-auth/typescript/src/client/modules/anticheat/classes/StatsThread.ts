import { Events } from '@dgx/client';

export class StatsThread {
  private thread: NodeJS.Timer | null = null;
  private ammoInfo: number[] = [];

  pushAmmo() {
    if (this.ammoInfo.length === 0) return;
    Events.emitNet('auth:anticheat:stats:ammoInfo', this.ammoInfo);
    this.ammoInfo = [];
  }

  startThread() {
    if (this.thread) {
      this.stopThread();
    }
    let timeout = 200;
    this.thread = setInterval(() => {
      const ped = PlayerPedId();
      const [_, currentWeapon] = GetCurrentPedWeapon(ped, true);
      if (IsPedShooting(ped)) {
        const ammo = GetPedAmmoByType(ped, GetPedAmmoTypeFromWeapon(ped, currentWeapon));
        if (this.ammoInfo.at(-1) === ammo) return;
        this.ammoInfo.push(ammo);
        timeout = 200;
      } else {
        timeout--;
      }
      if (timeout == 0) {
        this.pushAmmo();
        timeout = 500;
      }
    }, 10);
  }

  stopThread() {
    if (!this.thread) return;
    clearInterval(this.thread);
    this.pushAmmo();
    this.thread = null;
  }
}
