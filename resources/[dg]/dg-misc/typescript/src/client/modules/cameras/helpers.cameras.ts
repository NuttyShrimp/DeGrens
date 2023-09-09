import { Keys, Util } from '@dgx/client';

export const createCameraScaleform = async () => {
  const scaleform = await Util.loadScaleform('instructional_buttons');

  BeginScaleformMovieMethod(scaleform, 'CLEAR_ALL');
  EndScaleformMovieMethod();

  BeginScaleformMovieMethod(scaleform, 'SET_CLEAR_SPACE');
  ScaleformMovieMethodAddParamInt(200);
  EndScaleformMovieMethod();

  BeginScaleformMovieMethod(scaleform, 'SET_DATA_SLOT');

  ScaleformMovieMethodAddParamInt(1);
  const exitKey = Keys.getBindedKey('+camera_exit');
  ScaleformMovieMethodAddParamPlayerNameString(exitKey);

  BeginTextCommandScaleformString('STRING');
  AddTextComponentSubstringKeyboardDisplay('Sluit Camera');
  EndTextCommandScaleformString();

  EndScaleformMovieMethod();

  BeginScaleformMovieMethod(scaleform, 'DRAW_INSTRUCTIONAL_BUTTONS');
  EndScaleformMovieMethod();

  BeginScaleformMovieMethod(scaleform, 'SET_BACKGROUND_COLOUR');
  ScaleformMovieMethodAddParamInt(0);
  ScaleformMovieMethodAddParamInt(0);
  ScaleformMovieMethodAddParamInt(0);
  ScaleformMovieMethodAddParamInt(80);
  EndScaleformMovieMethod();

  return scaleform;
};
