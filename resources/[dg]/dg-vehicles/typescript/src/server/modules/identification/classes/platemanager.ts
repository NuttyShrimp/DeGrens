import { SQL, Util } from '@dgx/server';

// This small class is used to prevent to create fake plates from existing plates.
export class PlateManager extends Util.Singleton<PlateManager>() {
  private plates: Set<string>;

  constructor() {
    super();
    this.plates = new Set();
    this.seedPlates();
  }

  private async seedPlates() {
    const DBPlates: { plate: string; fakeplate: string }[] = await SQL.query(
      'SELECT plate, fakeplate FROM player_vehicles'
    );
    DBPlates.forEach(({ plate, fakeplate }) => {
      this.plates.add(plate);
      this.plates.add(fakeplate);
    });
  }

  // Adds plate to the list if we spawn a vehicle
  registerPlate(plate: string) {
    this.plates.add(plate);
  }

  generatePlate() {
    let plate = Util.generateRndChar(8, false).toUpperCase();
    while (this.plates.has(plate)) {
      plate = Util.generateRndChar(8, false).toUpperCase();
    }
    return plate;
  }
}

const plateManager = PlateManager.getInstance();
export default plateManager;
