import events from './events';
import interaction from './interaction';
import inventory from './inventory';
import jobs from './jobs';
import minigames from './minigames';
import phone from './phone';
import storage from './storage';
import sync from './sync';
import ui from './ui';
import util from './util';
import weapons from './weapons';
import weather from './weather';

export const { Events, RPC } = events;
export const { Peek, RayCast, PolyZone, Keys, PolyTarget } = interaction;
export const { Util, Interiors, PropAttach, Particle, Sounds, Animations } = util;
export const { UI, Taskbar, Notifications, HUD } = ui;
export const { Jobs, Business, Gangs, Police, Hospital } = jobs;
export const { Storage } = storage;
export const { Sync } = sync;
export const { Inventory } = inventory;
export const { Minigames } = minigames;
export const { Weapons } = weapons;
export const { Weather } = weather;
export const { Phone } = phone;
