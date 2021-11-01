# qb-multicharacter
Multi Character Feature for dg-core Framework :people_holding_hands:

# License

    DGCore Framework
    Copyright (C) 2021 Joshua Eger

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>


## Dependencies
- [dg-core](https://github.com/DGCore-framework/dg-core)
- [qb-spawn](https://github.com/DGCore-framework/qb-spawn) - Spawn selector
- [qb-apartments](https://github.com/DGCore-framework/qb-apartments) - For giving the player a apartment after creating a character.
- [qb-clothing](https://github.com/DGCore-framework/qb-clothing) - For the character creation and saving outfits.
- [dg-weathersync](https://github.com/DGCore-framework/dg-weathersync) - For adjusting the weather while player is creating a character.

## Screenshots
![Character Selection](https://i.imgur.com/EUB5X6Y.png)
![Character Registration](https://i.imgur.com/RKxiyed.png)

## Features
- Ability to create up to 5 characters and delete any character.
- Ability to see character information during selection.

## Installation
### Manual
- Download the script and put it in the `[qb]` directory.
- Add the following code to your server.cfg/resouces.cfg
```
ensure dg-core
ensure qb-multicharacter
ensure qb-spawn
ensure qb-apartments
ensure qb-clothing
ensure dg-weathersync
```
