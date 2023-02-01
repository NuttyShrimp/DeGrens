import { Events, Peek, Util } from '@dgx/client';

let peekIds: string[] = [];
let buildingEntries = false;

const sitOnChair = (chair: number, offset: Vec3) => {
  const entPos = Util.getEntityCoords(chair);
  const entRot = Util.getEntityCoords(chair);
  offset = {
    x: offset.y * -Math.sin((Math.PI / 180) * entRot.z),
    y: offset.y * Math.cos((Math.PI / 180) * entRot.z),
    z: offset.z,
  };

  const plyCoords = entPos.add(offset);
  const ped = PlayerPedId();

  SetEntityCoords(ped, plyCoords.x, plyCoords.y, plyCoords.z, true, false, false, false);
  SetEntityHeading(ped, GetEntityHeading(chair) - 180.0);
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
