import { doInsert, doInsertValues, doQuery, doScalar } from '../helpers/operations';

// asyncExports is niet nodig hier omdat de reden waarom asyncExports bestaat niet voorvalt in deze exports
// Het niet gebruiken vermijdt een setImmediate elke query wat mogelijks een impact kan geven
global.exports('query', doQuery);
global.exports('scalar', doScalar);
global.exports('insert', doInsert);
global.exports('insertValues', doInsertValues);
