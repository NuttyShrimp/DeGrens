class BlipManager {
  public addBlip = (createData: NBlipManager.CreateData) => {
    global.exports['dg-misc'].addBlip(createData);
  };

  public removeBlip = (id: string) => {
    global.exports['dg-misc'].removeBlip(id);
  };

  public enableCategory = (category: string) => {
    global.exports['dg-misc'].enableCategory(category);
  };

  public disableCategory = (category: string) => {
    global.exports['dg-misc'].disableCategory(category);
  };

  public removeCategory = (category: string) => {
    global.exports['dg-misc'].removeCategory(category);
  };

  public addPlayerBlip = (plyId: number, context: string, settings: NBlip.Settings, startCoords: Vec3) => {
    global.exports['dg-misc'].addPlayerBlip(plyId, context, settings, startCoords);
  };

  public deletePlayerBlip = (plyId: number | number[], context: string) => {
    global.exports['dg-misc'].deletePlayerBlip(plyId, context);
  };

  public changePlayerBlipSprite = (plyId: number, sprite: number) => {
    global.exports['dg-misc'].changePlayerBlipSprite(plyId, sprite);
  };
}

export default {
  BlipManager: new BlipManager(),
};
