import { RPC, UI } from '@dgx/client';

import { doAnimation } from '../modules/bank/service';

export class Location {
  private readonly id: string;
  private readonly name: string;
  private readonly center: Vec3;
  private blip!: number;
  private is_active = false;
  private is_disabled = false;

  constructor(center: Vec3, name: string, id: string) {
    this.name = name;
    this.id = id;
    this.center = center;
    this.createBlip();
  }

  public async openMenu(): Promise<void> {
    if (this.is_disabled) return;
    if (!this.is_active) return;
    await doAnimation(false, true);
    const base = await RPC.execute<BaseState>('financials:accounts:open', this.id);
    if (!base) return;
    base.isAtm = false;
    UI.openApplication('financials', base);
  }

  //region Getters
  public getId(): string {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public isDisabled(): boolean {
    return this.is_disabled;
  }

  //region Setters
  public setActive(active: boolean): void {
    this.is_active = active;
  }

  //endregion

  public setDisabled(disabled: boolean): void {
    this.is_disabled = disabled;
  }

  private createBlip(): void {
    if (this.blip && DoesBlipExist(this.blip)) RemoveBlip(this.blip);
    this.blip = AddBlipForCoord(this.center.x, this.center.y, this.center.z);
    SetBlipSprite(this.blip, 272);
    SetBlipColour(this.blip, 2);
    SetBlipDisplay(this.blip, 2);
    SetBlipScale(this.blip, 0.8);
    SetBlipAsShortRange(this.blip, true);
    BeginTextCommandSetBlipName('STRING');
    AddTextComponentString('Bank');
    EndTextCommandSetBlipName(this.blip);
  }

  //endregion
}
