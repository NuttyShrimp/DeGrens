class Particles {
  public add = (data: Particles.Particle): string => {
    return global.exports['dg-misc'].addParticle(data);
  };
  public remove = (id: string) => {
    global.exports['dg-misc'].removeParticle(id);
  };
}

export default {
  Particles: new Particles(),
};
