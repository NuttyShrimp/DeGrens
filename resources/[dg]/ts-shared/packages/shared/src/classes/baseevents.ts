export class BaseEvents {
  /**
   * @param filterResource Defaults to current resource. Set to 'any' to listen to all resources
   */
  public onResourceStart = (
    handler: (resourceName: string) => void,
    filterResource: 'any' | (string & {}) = GetCurrentResourceName()
  ) => {
    on('onResourceStart', (name: string) => {
      if (filterResource !== 'any' && name !== filterResource) return;
      handler(name);
    });
  };

  /**
   * @param filterResource Defaults to current resource. Set to 'any' to listen to all resources
   */
  public onResourceStop = (
    handler: (resourceName: string) => void,
    filterResource: 'any' | (string & {}) = GetCurrentResourceName()
  ) => {
    on('onResourceStop', (name: string) => {
      if (filterResource !== 'any' && name !== filterResource) return;
      handler(name);
    });
  };
}
