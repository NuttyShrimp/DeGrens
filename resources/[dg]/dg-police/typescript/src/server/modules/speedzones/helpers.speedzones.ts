import { MINIMUM_STRESS_INCREASE, STRESS_PER_KPH } from './constants.speedzones';

export const calculateStressIncrease = (speed: number) => MINIMUM_STRESS_INCREASE + speed * STRESS_PER_KPH;
