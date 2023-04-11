import { isFPCamEnabled, startFPCam } from './service.fpcam';

global.asyncExports('startFirstPersonCam', startFPCam);
global.exports('isFirstPersonCamEnabled', isFPCamEnabled);
