import { Events } from "@dgx/server";

export const getNoclipInfo: CommandData = {
  name: 'getNoclipInfo',
  role: 'developer',
  target: false,
  isClientCommand: false,
  log: 'retrieved noclip info',
  handler: caller => {
    Events.emitNet('admin:noclip:printInfo', caller.source);
  },
  UI: {
    title: 'Get Noclip Info',
    bindable: true,
  },
};
