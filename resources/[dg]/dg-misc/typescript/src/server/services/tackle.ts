import { Events } from "@dgx/server";

Events.onNet("misc:tackle:server", (target: number) => {
  Events.emitNet("misc:tackle:do", target)
})
