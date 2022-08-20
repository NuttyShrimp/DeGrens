import { doInsert, doInsertValues, doQuery, doScalar } from '../helpers/operations';

global.exports('query', doQuery);
global.exports('scalar', doScalar);
global.exports('insert', doInsert);
global.exports('insertValues', doInsertValues);
