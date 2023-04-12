class Particles {
  /**
   * @param plyId MUST BE IN RANGE
   */
  public add = (plyId: number, data: Particles.Particle): Promise<string> => {
    return global.exports['dg-misc'].addParticle(plyId, data);
  };

  public remove = (plyId: number, id: string) => {
    global.exports['dg-misc'].removeParticle(plyId, id);
  };
}

export default {
  Particles: new Particles(),
};
