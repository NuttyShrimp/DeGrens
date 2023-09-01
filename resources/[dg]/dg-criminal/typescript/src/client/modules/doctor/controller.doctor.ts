import { RPC, UI, Peek, Events } from '@dgx/client';

UI.RegisterUICallback('laptop/criminaldocter/request', async (_: unknown, cb) => {
  const result = await RPC.execute<string>('criminal:doctor:request');
  cb({ data: result, meta: { ok: true, message: 'done' } });
});

Peek.addFlagEntry('criminalDoctorId', {
  options: [
    {
      label: 'Verzorgen',
      icon: 'fas fa-suitcase-medical',
      action: (_, entity) => {
        if (!entity || !DoesEntityExist(entity)) return;

        const criminalDoctorId: number | undefined = Entity(entity).state.criminalDoctorId;
        if (criminalDoctorId === undefined) return;

        Events.emitNet('criminal:doctor:heal', criminalDoctorId);
      },
    },
  ],
});
