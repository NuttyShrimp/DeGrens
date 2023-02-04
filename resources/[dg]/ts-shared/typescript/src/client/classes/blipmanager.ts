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
}

export default {
  BlipManager: new BlipManager(),
};
