class Weather {
  public freezeTime = (freeze: boolean, atMinutes?: number) => {
    global.exports['dg-weathersync'].freezeTime(freeze, atMinutes);
  };

  public freezeWeather = (freeze: boolean, type?: string) => {
    global.exports['dg-weathersync'].freezeWeather(freeze, type);
  };
}

export default {
  Weather: new Weather(),
};
