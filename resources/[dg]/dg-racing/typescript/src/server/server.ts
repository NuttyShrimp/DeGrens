import './helpers';
import './controllers/cmd';
import './controllers/events';
import './controllers/actions';
import { loadTracks } from 'services/tracks';

setImmediate(() => {
  loadTracks();
});
