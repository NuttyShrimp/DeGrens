class Particles {
  /**
   * @param plyId Must be in range
   * @returns id gets returned if the particle is of `looped` kind
   */
  public add = (plyId: number, data: Misc.Particles.Data): string | undefined => {
    return global.exports['dg-misc'].addParticle(plyId, data);
  };

  public remove = (id: string) => {
    global.exports['dg-misc'].removeParticle(id);
  };
}

export default {
  Particles: new Particles(),
};
