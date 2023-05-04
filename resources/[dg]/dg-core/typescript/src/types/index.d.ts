declare namespace Modules {
  interface Module {
    onStart?: () => void;
    onStop?: () => void;
  }

  interface ServerModule extends Module {
    onPlayerDropped?: (src: number, reason: string) => void | Promise<void>;
    onPlayerJoining?: (
      src: number,
      name: string,
      setKickReason: (reason: string) => void,
      deferrals: Record<string, any>
    ) => void | Promise<void>;
    onPlayerJoined?: (src: number, oldSource: number) => void | Promise<void>;
  }
}
