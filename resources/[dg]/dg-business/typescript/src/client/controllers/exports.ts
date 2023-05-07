import { getInsideBusiness } from 'service/inside';
import { isEmployee } from 'service/permscache';
import { isSignedInAtBusiness, isSignedInAtAnyOfBusinessType } from 'service/signin';

global.exports('isSignedInAtBusiness', isSignedInAtBusiness);
global.exports('isSignedInAtAnyOfBusinessType', isSignedInAtAnyOfBusinessType);
global.exports('getBusinessPlayerIsInsideOf', getInsideBusiness);
global.exports('isEmployee', isEmployee);
