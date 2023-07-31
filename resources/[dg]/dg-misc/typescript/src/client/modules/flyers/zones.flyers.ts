import { Events, Peek, PolyTarget, UI } from '@dgx/client';
import { Vector3 } from '@dgx/shared';

Peek.addModelEntry(['prop_printer_01', 'prop_printer_02', 'v_res_printer'], {
  distance: 1.5,
  options: [
    {
      label: 'Create flyer',
      icon: 'clipboard-question',
      action: async () => {
        const inputs = await UI.openInput<{ link: string }>({
          header: 'Request flyer',
          inputs: [
            {
              name: 'link',
              label: 'Link (should end with .png or another valid image extension)',
              type: 'text',
            },
          ],
        });
        if (!inputs || !inputs.accepted) return;
        Events.emitNet('misc:flyers:requestFlyer', inputs.values.link);
      },
    },
    {
      label: 'Requested flyers',
      icon: 'print',
      action: () => {
        Events.emitNet('misc:flyers:openRequestMenu');
      },
    },
  ],
});

PolyTarget.addBoxZone('police_badge_creator', new Vector3(444.99, -980.98, 30.69), 1.2, 0.6, {
  heading: 0,
  minZ: 30.49,
  maxZ: 31.09,
  data: {
    id: 1,
  },
});

Peek.addZoneEntry('police_badge_creator', {
  distance: 1.5,
  options: [
    {
      label: 'Create Police Badge',
      icon: 'id-card',
      job: 'police',
      action: () => {
        Events.emitNet('misc:flyers:createPoliceBadge');
      },
    },
  ],
});
