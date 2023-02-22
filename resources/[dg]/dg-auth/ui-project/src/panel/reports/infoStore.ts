import { loginPlayer } from './actions';

let panelInfo: Panel.Auth.Info = {
  endpoint: '',
  token: '',
  steamId: '',
};
let loggingIn = false;

export const setInfo = (info: Panel.Auth.Info) => {
  panelInfo = info;
  loginPlayer();
};

export const getPanelInfo = () => panelInfo;

export const setLoggingIn = (isLI: boolean) => {
  loggingIn = isLI;
};

export const isLoggingIn = () => loggingIn;