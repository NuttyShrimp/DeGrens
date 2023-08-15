import { Util } from './util';

const util = new Util();
declare type HookFunction = (this: Thread, ref: Thread) => void | Promise<void>;

export class Thread {
  private active: boolean;
  private aborted: boolean;
  private callback: Function;

  private delay: number;
  private mode: Thread.Mode;

  private threadStore: number | NodeJS.Timeout | NodeJS.Timer | null;

  private hooks: Map<Thread.Hook, HookFunction[]>;

  data: Record<string, any>;

  constructor(cb: HookFunction, delay: number, mode: Thread.Mode = 'interval') {
    this.active = false;
    this.aborted = false;
    this.callback = cb;
    this.delay = delay;
    this.mode = mode;
    this.threadStore = null;
    this.data = {};
    this.hooks = new Map([
      ['active', []],
      ['preStop', []],
      ['preStart', []],
      ['afterStop', []],
      ['afterStart', []],
      ['stopAborted', []],
      ['startAborted', []],
    ]);
  }

  get isActive() {
    return this.active;
  }
  async start() {
    if (this.active) {
      return;
    }
    this.aborted = false;
    const preStartHooks = this.hooks.get('preStart') ?? [];
    try {
      for (const hook of preStartHooks) {
        if (!this.aborted) {
          await hook.call(this, this);
        }
      }
    } catch (error: any) {
      this.aborted = true;
      console.log('Error while calling pre-start hook', error.message);
    }
    if (this.aborted) {
      try {
        const abortHooks = this.hooks.get('startAborted') ?? [];
        for (const hook of abortHooks) {
          await hook.call(this, this);
        }
      } catch (error: any) {
        console.log('Error while calling start-aborted hook', error.message);
      }
      return;
    }
    this.active = true;
    const activeHooks = this.hooks.get('active') ?? [];
    switch (this.mode) {
      case 'tick': {
        this.threadStore = setTick(async () => {
          try {
            await this.callback.call(this);
            for (const hook of activeHooks) {
              await hook.call(this, this);
            }
          } catch (error: any) {
            console.log('Error while calling active hook', error.message);
          }
          this.delay > 0 && (await util.Delay(this.delay));
        });
        break;
      }
      case 'interval': {
        this.threadStore = setInterval(async () => {
          try {
            await this.callback.call(this, this);
            for (const hook of activeHooks) {
              await hook.call(this, this);
            }
          } catch (error: any) {
            console.log('Error while calling active hook', error.message);
          }
        }, this.delay);
        break;
      }
      case 'timeout': {
        const timeout = () => {
          if (this.active) {
            this.threadStore = setTimeout(async () => {
              try {
                await this.callback.call(this);
                for (const hook of activeHooks) {
                  await hook.call(this, this);
                }
              } catch (error: any) {
                console.log('Error while calling active hook', error.message);
              }
              return timeout();
            }, this.delay);
          }
        };
        timeout();
        break;
      }
    }
    const afterStartHooks = this.hooks.get('afterStart') ?? [];
    try {
      for (const hook of afterStartHooks) {
        await hook.call(this, this);
      }
    } catch (error: any) {
      console.log('Error while calling after-start hook', error.message);
    }
  }
  async stop() {
    if (!this.active) {
      return;
    }
    const preStopHooks = this.hooks.get('preStop') ?? [];
    try {
      for (const hook of preStopHooks) {
        if (!this.aborted) {
          await hook.call(this, this);
        }
      }
    } catch (error: any) {
      this.aborted = true;
      console.log('Error while calling pre-stop hook', error.message);
    }
    this.active = false;
    switch (this.mode) {
      case 'tick': {
        clearTick(this.threadStore as number);
        break;
      }
      case 'interval': {
        clearInterval(this.threadStore as NodeJS.Timer);
        break;
      }
      case 'timeout': {
        clearTimeout(this.threadStore as NodeJS.Timeout);
        break;
      }
    }
    if (this.aborted) {
      try {
        const stopAbortedHooks = this.hooks.get('stopAborted') ?? [];
        for (const hooks of stopAbortedHooks) {
          await hooks.call(this, this);
        }
      } catch (error: any) {
        console.log('Error while calling stop-aborted hook', error.message);
      }
      return;
    }
    const afterStopHooks = this.hooks.get('afterStop') ?? [];
    try {
      for (const hook of afterStopHooks) {
        await hook.call(this, this);
      }
    } catch (error: any) {
      console.log('Error while calling after-stop hook', error.message);
    }
  }
  abort() {
    this.aborted = true;
  }
  addHook(hookName: Thread.Hook, cb: HookFunction) {
    const hooks = this.hooks.get(hookName);
    if (!hooks) return;
    hooks.push(cb);
  }
}
