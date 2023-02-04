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
}

export default {
  Sounds: new Sounds(),
};
