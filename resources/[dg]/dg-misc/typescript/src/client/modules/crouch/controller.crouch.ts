import { changeWalk } from './service.crouch';

// 5M Provides no getter for movement clipset, cache it on change to properly be able to reset
on('walkChanged', (walk: string) => {
  changeWalk(walk);
});
