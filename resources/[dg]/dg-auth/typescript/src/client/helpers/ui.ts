export const RegisterUICallback = <T = any>(eventName: string, handler: (data: T, cb: UICallback) => void) => {
  RegisterNuiCallbackType(eventName);
  on(`__cfx_nui:${eventName}`, handler);
};
