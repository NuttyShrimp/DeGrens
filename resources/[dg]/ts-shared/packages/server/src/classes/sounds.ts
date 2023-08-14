import { Util } from './index';

class Sounds {
  public playOnEntity = (id: string, name: string, audiobank: string, netId: number) => {
    global.exports['nutty-sounds'].playSoundOnEntity(id, name, audiobank, netId);
  };

  public playFromCoord = (id: string, name: string, audiobank: string, coords: Vec3, range: number) => {
    global.exports['nutty-sounds'].playSoundFromCoord(id, name, audiobank, coords, range);
  };

  public stop = (id: string) => {
    global.exports['nutty-sounds'].stopSound(id);
  };

  /**
   * @param soundName name of .ogg filename
   * @param volume 0-1
   */
  public playLocalSoundForPlayer = (plyId: number, soundName: string, volume: number) => {
    global.exports['dg-localsounds'].playSound(plyId, soundName, volume);
  };

  /**
   * @param soundName name of .ogg filename
   * @param volume 0-1
   */
  public playLocalSoundForAll = (soundName: string, volume: number) => {
    this.playLocalSoundForPlayer(-1, soundName, volume);
  };

  //#region Helpers functions to not have to remember common sound names
  public playSuccessSoundFromCoord = (coords: Vec3, success: boolean) => {
    const soundName = success ? 'Keycard_Success' : 'Keycard_Fail';
    this.playFromCoord(`success_sound_${Util.uuidv4()}`, soundName, 'DLC_HEISTS_BIOLAB_FINALE_SOUNDS', coords, 10);
  };
  //#endregion
}

export default {
  Sounds: new Sounds(),
};
