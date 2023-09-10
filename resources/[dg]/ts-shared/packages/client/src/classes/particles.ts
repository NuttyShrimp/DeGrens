class Particles {
  /**
   * @returns id gets returned if the particle is of `looped` kind
   */
  public add = (data: Misc.Particles.Data): string | undefined => {
    return global.exports['dg-misc'].addParticle(data);
  };
  public remove = (id: string) => {
    global.exports['dg-misc'].removeParticle(id);
  };
}

export default {
  Particles: new Particles(),
};
