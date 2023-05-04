import { Events } from '@dgx/client';
import { DGXEvent, EventListener } from '@dgx/client/decorators';

@EventListener()
export class CharacterModule implements Modules.Module {
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

  @DGXEvent('core:character:set:metadata')
  private updateMetadata(metadata: Core.Characters.Metadata) {
    this.metadata = metadata;
  }

  getMetadata = () => this.metadata;

  getCharinfo = () => this.charinfo;

  getPlayerData = () => ({
    citizenid: LocalPlayer.state.citizenid,
    charinfo: this.charinfo,
    metadata: this.metadata,
  });
}
