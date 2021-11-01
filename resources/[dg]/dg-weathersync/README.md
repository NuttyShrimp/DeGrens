# dg-weathersync
Synced weather and time for dg-core Framework :sunrise:

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

## Features
- Syncs the weather for all players

### Commands
- /blackout - Toggles blackout
- /clock [hour] [minute] - Sets the exact time
- /time [morning/noon/evening/night] - Sets the generic time
- /weather [type] - Changes the weather type 
- /freeze [weather/time] - Freezes the current weather/time

## Installation
### Manual
- Download the script and put it in the `[qb]` directory.
- Add the following code to your server.cfg/resouces.cfg
```
ensure dg-core
ensure dg-weathersync
```

## Configuration
You can adjust available weather and time types in dg-weathersync\server\main.lua
