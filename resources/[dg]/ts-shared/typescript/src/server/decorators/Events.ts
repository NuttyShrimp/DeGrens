import 'reflect-metadata';
import { Events } from '../classes';

/**
 * Decorator to register a event in a class. Must be used in combination with EventListeren decorator
 * This will register a event that can be triggered from S + C
 */
export const Event = (evtName: string) => {
  return function (target: unknown, key: string) {
    if (!Reflect.hasMetadata('events', target)) {
      Reflect.defineMetadata('events', [], target);
    }

    const netEvents = Reflect.getMetadata('events', target) as Array<Decorators.Event>;

    netEvents.push({
      name: evtName,
      net: true,
      key,
    });
    Reflect.defineMetadata('events', netEvents, target);
  };
};

export const DGXEvent = (evtName: string) => {
  return function (target: unknown, key: string) {
    if (!Reflect.hasMetadata('events', target)) {
      Reflect.defineMetadata('events', [], target);
    }

    const netEvents = Reflect.getMetadata('events', target) as Array<Decorators.Event>;

    netEvents.push({
      name: evtName,
      net: true,
      dgx: true,
      key,
    });
    Reflect.defineMetadata('events', netEvents, target);
  };
}

/**
 * Register a event that is emitted to only the current side of the resource (client or server)
 */
export const LocalEvent = (evtName: string) => {
  return function(target: unknown, key:string) {
    if (!Reflect.hasMetadata('events', target)) {
      Reflect.defineMetadata('events', [], target);
    }

    const netEvents = Reflect.getMetadata('events', target) as Array<Decorators.Event>;

    netEvents.push({
      name: evtName,
      net: false,
      key,
    });
    Reflect.defineMetadata('events', netEvents, target);
  }
}

/**
 * Add listeners for events on class creation
 */
export const EventListener = () => {
  return function <T extends { new (...args: any[]): any }>(constructor: T) {
    return class extends constructor {
      constructor(...args: any[]) {
        super(...args);

        if (!Reflect.hasMetadata('events', this)) {
          Reflect.defineMetadata('events', [], this);
        }

        const events = Reflect.getMetadata('events', this) as Array<Decorators.Event>;
        events.forEach(e => {
          if (e.dgx) {
            if (e.net){
              Events.onNet(e.name, (...args: any[]) => {
                this[e.key](...args);
              });
            }
          } else {
            if (e.net) {
              onNet(e.name, (...evtArgs: any[]) => {
                this[e.key](source, ...evtArgs);
              });
            } else {
              on(e.name, (...evtArgs: any[]) => {
                this[e.key](...evtArgs);
              });
            }
          }
        });
      }
    };
  };
};
