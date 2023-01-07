export const applyScreenBlur = () => {
  TriggerScreenblurFadeIn(250);
  setTimeout(() => {
    TriggerScreenblurFadeOut(250);
  }, 500);
};
