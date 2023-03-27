import { modifyAnimLoop, setAnimationsPaused, startAnimLoop, stopAnimLoop } from './service.animloop';

global.exports('startAnimLoop', startAnimLoop);
global.exports('stopAnimLoop', stopAnimLoop);
global.exports('modifyAnimLoop', modifyAnimLoop);
global.exports('setAnimLoopAnimationsPaused', setAnimationsPaused);
