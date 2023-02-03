import { Events, Peek, Util } from '@dgx/client';

let peekIds: string[] = [];

const sitOnChair = (chair: number, offset: Vec3) => {
  const entPos = Util.getEntityCoords(chair);
  const entHeading = GetEntityHeading(chair);

  offset = {
    x: offset.y * -Math.sin((Math.PI / 180) * entHeading),
    y: offset.y * Math.cos((Math.PI / 180) * entHeading),
    z: offset.z,
  };

  const plyCoords = entPos.add(offset);
  const ped = PlayerPedId();

  SetEntityCoords(ped, plyCoords.x, plyCoords.y, plyCoords.z, false, false, false, false);
  SetEntityHeading(ped, entHeading - 180.0);
  emit('animations:client:EmoteCommandStart', ['sitchair']);
};

const registerSeatModels = (seats: Config.Seats.Seat[]) => {
  peekIds.forEach(id => Peek.removeModelEntry(id));
  peekIds = seats
    .map(s =>
      Peek.addModelEntry(s.model, {
        options: [
          {
            icon: 'chair',
            label: 'Zit',
            action: (_, ent) => {
              if (!ent) return;
              sitOnChair(ent, s.offset);
            },
          },
        ],
        distance: 2,
      })
    )
    .flat();
};

Events.onNet('misc:seats:seed', (config: Config.Seats.Config) => {
  registerSeatModels(config.seats);
});
