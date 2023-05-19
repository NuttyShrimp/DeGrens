import { Animations, Particles, Util } from '@dgx/client';

export const FxBlackOut = async () => {
  AnimpostfxPlay('MinigameTransitionIn', 300, true);
  await Util.Delay(600);
  DoScreenFadeOut(200);
  await Util.Delay(200);
  DoScreenFadeIn(200);
  await Util.Delay(200);
  DoScreenFadeOut(400);
  await Util.Delay(400);
  DoScreenFadeIn(400);
  SetPedToRagdoll(PlayerPedId(), 10000, 10000, 0, false, false, false);
  await Util.Delay(600);
  DoScreenFadeOut(800);
  await Util.Delay(4000);
  DoScreenFadeIn(700);
  await Util.Delay(300);
  AnimpostfxStop('MinigameTransitionIn');
  AnimpostfxPlay('MinigameTransitionOut', 3500, false);
  await Util.Delay(3500);
  AnimpostfxStop('MinigameTransitionOut');
};

export const fxPuke = async () => {
  const pfxId = Particles.add({
    dict: 'scr_paletoscore',
    name: 'scr_trev_puke',
    boneIndex: 31086,
    netId: NetworkGetNetworkIdFromEntity(PlayerPedId()),
    looped: true,
  });
  const animId = Animations.startAnimLoop({
    disableAllControls: true,
    animation: {
      dict: 'missheistpaletoscore1leadinout',
      name: 'trv_puking_leadout',
      flag: 1,
    },
  });
  await Util.Delay(3500);
  Particles.remove(pfxId);
  Animations.stopAnimLoop(animId);
};
