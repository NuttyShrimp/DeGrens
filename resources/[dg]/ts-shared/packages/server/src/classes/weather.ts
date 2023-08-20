class Weather {
  public setCurrentTime = (time: number) => {
    global.exports['dg-weathersync'].setCurrentTime(time);
  };

  public getCurrentTime = (): number => {
    return global.exports['dg-weathersync'].getCurrentTime();
  };

  public getCurrentHour = (): number => {
    return global.exports['dg-weathersync'].getCurrentHour();
  };

  public getCurrentMinute = (): number => {
    return global.exports['dg-weathersync'].getCurrentMinute();
  };

  public getWeatherTypes = (): string[] => {
    return global.exports['dg-weathersync'].getWeatherTypes();
  };

  public setCurrentWeather = (type: string) => {
    global.exports['dg-weathersync'].setCurrentWeather(type);
  };

  public getCurrentWeather = (): number => {
    return global.exports['dg-weathersync'].getCurrentWeather();
  };

  public freezeTime = (freeze: boolean, atMinutes?: number) => {
    global.exports['dg-weathersync'].freezeTime(freeze, atMinutes);
  };

  public isTimeFrozen = (): boolean => {
    return global.exports['dg-weathersync'].isTimeFrozen();
  };
}

export default {
  Weather: new Weather(),
};
