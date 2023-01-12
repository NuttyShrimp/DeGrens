import handler from 'classes/handler';
import './controllers';
import './sv_logger';

setImmediate(() => {
  handler.query('SET TRANSACTION ISOLATION LEVEL READ COMMITTED');
});
