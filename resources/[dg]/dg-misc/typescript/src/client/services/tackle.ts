import { Events, Keys, Police, Util } from '@dgx/client';

Events.onNet('misc:tackle:do', () => {
  SetPedToRagdoll(
    PlayerPedId(),
    Util.getRndInteger(3000, 6000),
    Util.getRndInteger(3000, 6000),
    0,
    false,
    false,
    false
  );
});

const tackleInit = async () => {
  const ped = PlayerPedId();
  if (
    IsPedInAnyVehicle(ped, false) ||
    GetEntitySpeed(ped) < 2.5 ||
    IsPedRagdoll(ped) ||
    Police.isCuffed() ||
    Police.isEscorting() ||
    !IsPedJumping(ped)
  )
    return;

  const closestPlayer = Util.getClosestPlayerInDistanceAndOutsideVehicle(2);
  if (!closestPlayer) return;

  Events.emitNet('misc:tackle:server', GetPlayerServerId(closestPlayer));
  await Util.loadAnimDict('swimming@first_person@diving');
  if (IsEntityPlayingAnim(ped, 'swimming@first_person@diving', 'dive_run_fwd_-45_loop', 3)) {
    ClearPedTasksImmediately(ped);
  } else {
    TaskPlayAnim(
      ped,
      'swimming@first_person@diving',
      'dive_run_fwd_-45_loop',
      3.0,
      3.0,
      -1,
      49,
      0,
      false,
      false,
      false
    );
    await Util.Delay(250);
    ClearPedTasksImmediately(ped);
    SetPedToRagdoll(ped, 150, 150, 0, false, false, false);
  }
};

Keys.onPressDown('tackle', () => {
  tackleInit();
});

Keys.register('tackle', '(gov) iemand tacklen', 'LMENU');
