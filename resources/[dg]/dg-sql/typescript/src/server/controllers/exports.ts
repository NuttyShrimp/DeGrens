import { doInsert, doInsertValues, doQuery, doSscalar } from '../helpers/operations';

global.exports('query', doQuery);
global.exports('scalar', doSscalar);
global.exports('insert', doInsert);
global.exports('insertValues', doInsertValues);
