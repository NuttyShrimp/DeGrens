import { Keys } from '@dgx/client';
import { enterCamera, exitCamera, handleCameraMovementKeyAction, isCameraActive } from './service.cameras';

Keys.register('camera_exit', '(camera) exit', 'ESCAPE');
Keys.onPressDown('camera_exit', () => exitCamera(), true);

Keys.register('camera_up', '(camera) move up', 'W');
Keys.onPress('camera_up', down => handleCameraMovementKeyAction('up', down), true);

Keys.register('camera_down', '(camera) move down', 'S');
Keys.onPress('camera_down', down => handleCameraMovementKeyAction('down', down), true);

Keys.register('camera_right', '(camera) move right', 'D');
Keys.onPress('camera_right', down => handleCameraMovementKeyAction('right', down), true);

Keys.register('camera_left', '(camera) move left', 'A');
Keys.onPress('camera_left', down => handleCameraMovementKeyAction('left', down), true);

global.asyncExports('enterCamera', enterCamera);
global.asyncExports('exitCamera', exitCamera);
global.asyncExports('isCameraActive', isCameraActive);
