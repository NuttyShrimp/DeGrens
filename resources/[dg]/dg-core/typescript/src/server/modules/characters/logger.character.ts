import { mainLogger } from "sv_logger";

export const characterLogger = mainLogger.child({
  module: "characters",
});