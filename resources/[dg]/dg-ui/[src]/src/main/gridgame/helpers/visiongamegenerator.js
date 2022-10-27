export const generateVisiongame = gridSize => {
  const grid = new Grid(gridSize);
  grid.setInstance(grid);
  grid.generate();

  const puzzle = {};
  grid.maxify();
  puzzle.end = grid.tiles.map(t => (t.value === 0 ? 'color' : 'active'));

  grid.breakDown();
  puzzle.start = grid.tiles.map((tile, i) => ({
    id: i,
    type: tile.value === 0 ? 'color' : tile.value === -1 ? 'disabled' : 'active',
    label: tile.value !== 0 && tile.value !== -1 ? tile.value : null,
  }));

  return puzzle;
};

class Tile {
  grid;
  value;
  type;
  x;
  y;

  constructor(value, grid, index) {
    this.grid = grid;
    this.x = index % grid?.size;
    this.y = Math.floor(index / grid?.size);
    this.setValue(value);
  }

  setValue(val) {
    if (val == -2) {
      this.value = val;
      this.type = Tile.Type.Dot;
    } else if (isNaN(val) || val < 0 || val > 90) {
      this.value = -1;
      this.type = Tile.Type.Unknown;
    } else {
      this.value = val;
      this.type = val == 0 ? Tile.Type.Wall : Tile.Type.Value;
    }
  }

  setType(tileType) {
    switch (tileType) {
      case Tile.Type.Unknown:
        this.type = tileType;
        this.value = -1;
        break;
      case Tile.Type.Wall:
        this.type = tileType;
        this.value = 0;
        break;
      case Tile.Type.Dot:
        this.type = tileType;
        this.value = -2;
        break;
      case Tile.Type.Value:
        console.log("Error. Don't set tile type directly to Tile.Type.Value.");
        break;
    }
  }

  isDot() {
    return this.type == Tile.Type.Dot;
  }
  isWall() {
    return this.type == Tile.Type.Wall;
  }
  isNumber() {
    return this.type == Tile.Type.Value;
  }
  isUnknown() {
    return this.type == Tile.Type.Unknown;
  }

  dot() {
    this.setType(Tile.Type.Dot);
  }

  wall() {
    this.setType(Tile.Type.Wall);
  }

  number(n) {
    this.setValue(n);
  }

  unknown() {
    this.setType(Tile.Type.Unknown);
  }

  traverse(hor, ver) {
    return this.grid.getTileAtXY(this.x + hor, this.y + ver);
  }

  move(dir) {
    switch (dir) {
      case Directions.Right:
        return this.traverse(1, 0);
      case Directions.Left:
        return this.traverse(-1, 0);
      case Directions.Up:
        return this.traverse(0, -1);
      case Directions.Down:
        return this.traverse(0, 1);
    }
  }

  collect(info) {
    // pass 1
    if (!info) {
      info = {
        unknownsAround: 0, // are there still any unknowns around
        numberCount: 0, // how many numbers/dots are seen in all directions
        numberReached: false, // if the current tile is a number and it has that many numbers/dots around
        canBeCompletedWithUnknowns: false, // if the number can be reached by exactly its amount of unknowns
        completedNumbersAround: false, // if the current tile has one or more numberReached tiles around (second pass only)
        singlePossibleDirection: null, // if there's only one way to expand, set this to that direction
        direction: {},
      };
      for (var dir in Directions) {
        info.direction[dir] = {
          unknownCount: 0,
          numberCountAfterUnknown: 0, // how many numbers after an unknown were found
          wouldBeTooMuch: false, // would filling an unknown with a number be too much
          maxPossibleCount: 0, // what would optionally be the highest count?
          maxPossibleCountInOtherDirections: 0,
          numberWhenDottingFirstUnknown: 0, // what number would this direction give when the first unknown was filled
        };
      }
      // the following for loops traverse over the OTHER tiles around the current one
      // so t is always one of the other tiles, giving information over the current tile
      var lastPossibleDirection = null,
        possibleDirCount = 0;

      for (const dir in Directions) {
        // check each direction but end at a wall or grid-boundary
        for (var t = this.move(dir); t && !t.isWall(); t = t.move(dir)) {
          var curDir = info.direction[dir];
          if (t.isUnknown()) {
            // if this is the first unknown in this direction, add it to the possible-would-be value
            if (!curDir.unknownCount) {
              curDir.numberWhenDottingFirstUnknown++;
            }
            curDir.unknownCount++;
            curDir.maxPossibleCount++;
            info.unknownsAround++;

            // if we're looking FROM a number, count the possible directions
            if (this.isNumber() && lastPossibleDirection != dir) {
              possibleDirCount++;
              lastPossibleDirection = dir;
            }
          } else if (t.isNumber() || t.isDot()) {
            // count the maximum possible value
            curDir.maxPossibleCount++;
            // if no unknown found yet in this direction
            if (!curDir.unknownCount) {
              info.numberCount++;
              curDir.numberWhenDottingFirstUnknown++;
            }
            // else if we were looking FROM a number, and we found a number with only 1 unknown in between...
            else if (this.isNumber() && curDir.unknownCount == 1) {
              curDir.numberCountAfterUnknown++;
              curDir.numberWhenDottingFirstUnknown++;
              if (curDir.numberCountAfterUnknown + 1 > this.value) {
                curDir.wouldBeTooMuch = true;
              }
            }
          }
        }
      }

      // if there's only one possible direction that has room to expand, set it
      if (possibleDirCount == 1) {
        info.singlePossibleDirection = lastPossibleDirection;
      }

      // see if this number's value has been reached, so its paths can be closed
      if (this.isNumber() && this.value == info.numberCount) info.numberReached = true;
      else if (this.isNumber() && this.value == info.numberCount + info.unknownsAround)
        info.canBeCompletedWithUnknowns = true;
    }
    // pass 2
    else {
      for (const dir in Directions) {
        const curDir = info.direction[dir];
        for (let t = this.move(dir); t && !t.isWall(); t = t.move(dir)) {
          if (t.isNumber() && t.info.numberReached) {
            info.completedNumbersAround = true; // a single happy number was found around
          }
        }
        // if we originate FROM a number, and there are unknowns in this direction
        if (this.isNumber() && !info.numberReached && curDir.unknownCount) {
          // check all directions other than this one
          curDir.maxPossibleCountInOtherDirections = 0;
          for (var otherDir in Directions) {
            if (otherDir != dir) curDir.maxPossibleCountInOtherDirections += info.direction[otherDir].maxPossibleCount;
          }
        }
      }
    }

    // if there's only one possible direction that has room to expand, set it
    if (possibleDirCount == 1) {
      info.singlePossibleDirection = lastPossibleDirection;
    }

    // see if this number's value has been reached, so its paths can be closed
    if (this.isNumber() && this.value == info.numberCount) info.numberReached = true;
    else if (this.isNumber() && this.value == info.numberCount + info.unknownsAround)
      info.canBeCompletedWithUnknowns = true;

    return info;
  }

  // puts a wall in the first empty tiles found in all directions
  close(withDots) {
    for (var dir in Directions) {
      this.closeDirection(dir, withDots);
    }
  }

  closeDirection(dir, withDots, amount) {
    for (var t = this.move(dir), count = 0; t; t = t.move(dir)) {
      if (t.isWall()) break;
      if (t.isUnknown()) {
        count++;
        if (withDots) t.dot(true);
        else {
          t.wall();
          break;
        }
      }
      if (count >= amount) break;
    }
  }

  // gets all tiles within a range from the current, not through walls though...
  getTilesInRange(max) {
    const result = [];

    for (var dir in Directions) {
      var distance = 0;
      for (var t = this.move(dir); t && !t.isWall(); t = t.move(dir)) {
        distance++;
        if (distance >= 1 && distance <= max) result.push(t);
      }
    }
    return result;
  }
}

Tile.Type = {
  Unknown: 'Unknown',
  Dot: 'Dot',
  Wall: 'Wall',
  Value: 'Value',
};

var Directions = {
  Left: 'Left',
  Right: 'Right',
  Up: 'Up',
  Down: 'Down',
};

class Grid {
  size;
  tiles = [];
  saveSlots = {};
  currentPuzzle = null;
  instance;

  constructor(size) {
    this.size = size;
  }

  setInstance(grid) {
    this.instance = grid;
  }

  getIndexAtXY(x, y) {
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) return -1;
    return y * this.size + x;
  }

  getTileAtXY(x, y) {
    if (x < 0 || x >= this.size || y < 0 || y >= this.size) return null;
    return this.tiles[this.getIndexAtXY(x, y)];
  }

  // Check if all tiles are not unknown or dot
  isDone() {
    for (let i = 0; i < this.tiles.length; i++) {
      const type = this.tiles[i].type;
      if (type == Tile.Type.Unknown || type == Tile.Type.Dot) return false;
    }
    return true;
  }

  // Chgange all unknowns or values to dot
  fillDots() {
    for (var i = 0; i < this.tiles.length; i++) {
      const tile = this.tiles[i];
      if (tile.type == Tile.Type.Unknown || tile.type == Tile.Type.Value) tile.dot();
    }
  }

  generate() {
    const length = Math.pow(this.size, 2);
    for (var i = 0; i < length; i++) {
      const tile = new Tile((this.size - 1) * 2, this.instance, i);
      this.tiles.push(tile);
    }
  }

  // get every number down to its max or below
  maxify() {
    let tryAgain = true;
    let attempts = 0;

    while (tryAgain && attempts++ < 99) {
      tryAgain = false;
      const maxTiles = shuffle(this.tiles);

      for (var i = 0; i < maxTiles.length; i++) {
        const tile = maxTiles[i];
        if (tile.value > this.size) {
          const cuts = shuffle(tile.getTilesInRange(1, this.size));
          let cut = null;
          let firstCut = null;

          while (!cut && cuts.length) {
            cut = cuts.pop();
            if (!firstCut) firstCut = cut;
          }
          if (!cut) cut = firstCut;
          if (cut) {
            cut.wall();
            this.fillDots();
            this.solve();
            tryAgain = true;
          }
          break;
        }
      }
    }
  }

  solve() {
    let tryAgain = true;
    let attempts = 0;
    let pool = [...this.tiles];

    while (tryAgain && attempts++ < 99) {
      tryAgain = false;

      if (this.isDone()) return true;

      // first pass collection
      for (let i = 0; i < pool.length; i++) {
        pool[i].info = pool[i].collect();
      }

      // second pass collection, now we have full info
      for (var i = 0; i < pool.length; i++) {
        var tile = pool[i],
          info = tile.collect(tile.info);

        // dots with no empty tiles in its paths can be fixed
        if (tile.isDot() && !info.unknownsAround) {
          tile.number(info.numberCount, true);
          tryAgain = true;
          break;
        }

        // if a number has unknowns around, perhaps we can fill those unknowns
        if (tile.isNumber() && info.unknownsAround) {
          // if its number is reached, close its paths by walls
          if (info.numberReached) {
            tile.close();
            tryAgain = true;
            break;
          }

          // if a tile has only one direction to go, fill the first unknown there with a dot and retry
          if (info.singlePossibleDirection) {
            tile.closeDirection(info.singlePossibleDirection, true, 1);
            tryAgain = true;
            break;
          }

          // check if a certain direction would be too much
          for (var dir in Directions) {
            var curDir = info.direction[dir];
            if (curDir.wouldBeTooMuch) {
              tile.closeDirection(dir);
              tryAgain = true;
              break;
            }
            // if dotting one unknown tile in this direction is at least required no matter what
            else if (
              curDir.unknownCount &&
              curDir.numberWhenDottingFirstUnknown + curDir.maxPossibleCountInOtherDirections <= tile.value
            ) {
              tile.closeDirection(dir, true, 1);
              tryAgain = true;
              break;
            }
          }
          // break out the outer for loop too
          if (tryAgain) break;
        }
        // if a number has its required value around, but still an empty tile somewhere, close it
        // (this core regards that situation FROM the empty unknown tile, not from the number itself)
        // (but only if there are no tiles around that have a number and already reached it)
        if (tile.isUnknown() && !info.unknownsAround && !info.completedNumbersAround) {
          if (info.numberCount == 0) {
            tile.wall();
            tryAgain = true;
            break;
          }
        }
      }
    }

    return false;
  }

  save(slot) {
    this.saveSlots[slot] = { values: [] };
    for (let i = 0; i < this.tiles.length; i++) {
      this.saveSlots[slot].values.push(this.tiles[i].value);
    }
  }

  restore(slot) {
    const saveSlot = this.saveSlots[slot];
    if (!saveSlot) return;
    this.tiles = [];
    for (let i = 0; i < saveSlot.values.length; i++) {
      const value = saveSlot.values[i];
      this.tiles.push(new Tile(value, this.instance, i));
    }
  }

  breakDown() {
    let tryAgain = true;
    let attempts = 0;
    let tile;
    let minWalls = 1;
    let pool = shuffle([...this.tiles]);
    let walls = pool.reduce((acc, t) => acc + (t.isWall() ? 1 : 0), 0);

    while (tryAgain && pool.length && attempts++ < 99) {
      tryAgain = false;
      this.save(1);

      // only use the pool for x,y coordinates, but retrieve the tile again because it has been rebuilt
      var tempTile = pool.pop();
      tile = this.tiles[this.getIndexAtXY(tempTile.x, tempTile.y)];
      var isWall = tile.isWall();

      // make sure there is a minimum of walls
      if (isWall && walls <= minWalls) continue;

      tile.unknown();
      this.save(2);
      if (this.solve()) {
        if (isWall) walls--;
        this.restore(2);
        tryAgain = true;
      } else {
        this.restore(1);
        tryAgain = true;
      }
    }
  }
}

const shuffle = sourceArray => {
  const shuffled = [...sourceArray];
  for (let i = 0; i < shuffled.length - 1; i++) {
    const r = i + Math.floor(Math.random() * (shuffled.length - i));
    [shuffled[i], shuffled[r]] = [shuffled[r], shuffled[i]];
  }
  return shuffled;
};
