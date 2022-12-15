declare namespace WeatherSync {
  type Type =
    | 'EXTRASUNNY'
    | 'CLEAR'
    | 'CLEARING'
    | 'OVERCAST'
    | 'SMOG'
    | 'FOGGY'
    | 'CLOUDS'
    | 'RAIN'
    | 'THUNDER'
    | 'SNOW'
    | 'BLIZZARD'
    | 'SNOWLIGHT'
    | 'XMAS'
    | 'HALLOWEEN';

  interface Weather {
    type: Type;
    windSpeed: number;
    windDirection: number;
    rainLevel?: number;
    temperature: number;
  }

  interface WeatherStateBag extends Weather {
    skipTransition: boolean;
  }
}
