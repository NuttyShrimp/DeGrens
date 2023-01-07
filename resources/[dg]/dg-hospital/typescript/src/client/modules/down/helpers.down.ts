import { Util } from '@dgx/client';
import { STATE_WEIGHTS, TEXT_COLORS } from './constants.down';

export const setText = (mainText: string, helperText: string, helperColor: keyof typeof TEXT_COLORS) => {
  drawUIText({
    font: 2,
    position: {
      x: 0.5,
      y: 0.9,
    },
    scale: 0.6,
    text: mainText,
    color: 'white',
  });
  drawUIText({
    font: 4,
    position: {
      x: 0.5,
      y: 0.935,
    },
    scale: 0.45,
    text: helperText,
    color: helperColor,
  });
};

const drawUIText = (data: {
  font: number;
  position: Vec2;
  scale: number;
  text: string;
  color: keyof typeof TEXT_COLORS;
}) => {
  SetTextFont(data.font);
  SetTextCentre(true);
  SetTextScale(data.scale, data.scale);
  const color = TEXT_COLORS[data.color];
  SetTextColour(color.r, color.g, color.b, 255);
  SetTextDropShadow();
  SetTextOutline();
  SetTextEntry('STRING');
  AddTextComponentString(data.text);
  EndTextCommandDisplayText(data.position.x, data.position.y);
};

export const getWeightOfState = (type: Hospital.State) => {
  return STATE_WEIGHTS[type] ?? 0;
};

export const doGetUpAnimation = async () => {
  const ped = PlayerPedId();
  let duration = 0;

  await Util.loadAnimDict('get_up@directional@transition@prone_to_knees@injured');
  await Util.loadAnimDict('get_up@directional@movement@from_knees@injured');

  // First anim phase
  duration = GetAnimDuration('get_up@directional@transition@prone_to_knees@injured', 'back_armsdown');
  duration = Math.round(duration * 1000) - 150;
  TaskPlayAnim(
    ped,
    'get_up@directional@transition@prone_to_knees@injured',
    'back_armsdown',
    8,
    8,
    duration,
    1,
    0,
    false,
    false,
    false
  );
  await Util.Delay(duration);

  // Second anim phase
  duration = GetAnimDuration('get_up@directional@movement@from_knees@injured', 'getup_r_0');
  duration = Math.round(duration * 1000) - 150;
  TaskPlayAnim(
    ped,
    'get_up@directional@movement@from_knees@injured',
    'getup_r_0',
    8,
    8,
    duration,
    1,
    0,
    false,
    false,
    false
  );
  await Util.Delay(duration);
};

export const setPedFlagsOnDown = () => {
  const ped = PlayerPedId();
  SetEntityProofs(ped, false, true, false, false, false, true, false, true); // drown & fireproof otherwise dead anim will scuff
  SetPedCanRagdoll(ped, false);
};

export const resetPedFlagsAfterDown = () => {
  const ped = PlayerPedId();
  SetEntityProofs(ped, false, false, false, false, false, true, false, false);
  SetPedCanRagdoll(ped, true);
};
