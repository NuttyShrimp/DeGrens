import { startPauseCheck } from 'services/controls';
import './controllers/exports';
import './controllers/keys';
import './controllers/ui';
import './controllers/events';
import './modules/camera/controller.camera';
import './services/calls';
import './services/contacts';
import './services/financials';
import './services/info';
import './services/justice';
import './services/mail';
import './services/state';
import './services/messages';
import './services/notes';
import './services/notifications';
import './services/pinger';
import './services/twitter';
import './services/yellowpages';

setImmediate(() => {
  startPauseCheck();
});
