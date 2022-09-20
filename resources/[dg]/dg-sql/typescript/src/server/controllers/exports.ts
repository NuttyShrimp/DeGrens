import { doInsert, doInsertValues, doQuery, doScalar } from '../helpers/operations';

global.asyncExports('query', doQuery);
global.asyncExports('scalar', doScalar);
global.asyncExports('insert', doInsert);
global.asyncExports('insertValues', doInsertValues);
