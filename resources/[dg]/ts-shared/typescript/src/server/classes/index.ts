import admin from './admin';
import config from './config';
import events from './events';
import interaction from './interaction';
import inventory from './inventory';
import jobs from './jobs';
import phone from './phone';
import ui from './ui';
import util from './util';
import financials from './financials';
import screenshot from './screenshot';
import sync from './sync';
import vehicles from './vehicles';
import weapons from './weapons';
import weather from './weather';

export const { Events, RPC, SQL, API, Auth } = events;
export const { Util, Sounds, Status, Reputations } = util;
export const { Phone } = phone;
export const { Chat, RayCast } = interaction;
export const { Config } = config;
export const { Jobs, Business, Gangs, Police } = jobs;
export const { Admin } = admin;
export const { UI, Taskbar, Notifications } = ui;
export const { Inventory } = inventory;
export const { Financials } = financials;
export const { Screenshot } = screenshot;
export const { Vehicles } = vehicles;
export const { Sync } = sync;
export const { Weapons } = weapons;
export const { Weather } = weather;
