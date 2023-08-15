import { Events } from '@dgx/client';
import { DGXEvent, Event, EventListener } from '@dgx/client/src/decorators';

@EventListener()
export class CharacterModule implements Modules.Module, Core.ClientModules.CharacterModule {
  private metadata: Core.Characters.Metadata | null = null;
  private charinfo: Core.Characters.Charinfo | null = null;

  onStart() {
    // Check if player has a character loaded and fetch data
    if (LocalPlayer.state.citizenid) {
      Events.emitNet('core:character:loadPlayer');
    }
  }

  @DGXEvent('core:character:set')
  private setInfo(metadata: Core.Characters.Metadata, charinfo: Core.Characters.Charinfo) {
    this.metadata = metadata;
    this.charinfo = charinfo;
  }

  @Event('core:characters:metadata:update')
  private updateMetadata = <T extends keyof Core.Characters.Metadata>(key: T, value: Core.Characters.Metadata[T]) => {
    if (this.metadata === null) return;
    this.metadata[key] = value;
  };

  getMetadata = () => this.metadata;

  getCharinfo = () => this.charinfo;

  getPlayerData = () => {
    const citizenid = LocalPlayer.state.citizenid as number | undefined;
    if (!citizenid || this.charinfo === null || this.metadata === null) return null;
    return {
      citizenid,
      charinfo: this.charinfo,
      metadata: this.metadata,
    };
  };
}
