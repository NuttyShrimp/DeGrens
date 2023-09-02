import { Events, RPC } from '@dgx/server';
import { healClosestPlayerToDoctor, requestDoctorLocation } from './service.doctor';

RPC.register('criminal:doctor:request', requestDoctorLocation);
Events.onNet('criminal:doctor:heal', healClosestPlayerToDoctor);
