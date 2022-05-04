import { Events } from '@dgx/server';
import { DGXEvent, Event, EventListener, Export, ExportRegister } from '@dgx/server/decorators';
import { handleCommandExecution } from 'helpers/commands';

@ExportRegister()
@EventListener()
class CommandManager {
  private static instance: CommandManager;

  static getInstance() {
    if (!this.instance) {
      this.instance = new CommandManager();
    }
    return this.instance;
  }

  private commands: Map<string, Server.Command>;
  private refreshTimeout: NodeJS.Timeout;

  constructor() {
    this.commands = new Map();
  }

  private specificRefresh(src: number) {
    const cmds: Shared.Command[] = [...this.commands.values()]
      .filter(cmd => DGCore.Functions.HasPermission(src, cmd.permissionLevel))
      .map(cmdInfo => {
        return cmdInfo;
      });
    Events.emitNet('chat:registerCommands', src, cmds);
  }

  private globalRefresh() {
    DGCore.Functions.GetPlayers().forEach(ply => this.specificRefresh(ply));
  }

  @DGXEvent('chat:requestRefresh')
  @Event('DGCore:Server:OnPlayerLoaded')
  @Export('refreshCommands')
  public refreshCommands(src = -1) {
    src === -1 ? this.globalRefresh() : this.specificRefresh(src);
  }

  @Export('registerCommand')
  public registerCommand(
    name: string,
    description: string,
    parameters: Shared.Parameter[] = [],
    permissionLevel = 'user',
    handler: Server.CommandHandler
  ) {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    parameters.reduce((wasReq, val) => {
      if (!wasReq && val.required) {
        throw new Error(
          `Could not register ${name} command because there are requirede parameters after optional ones`
        );
      }
      return val.required ?? true;
    }, true);
    name = name.replace(/^\//, '');
    RegisterCommand(
      name,
      (src: number, args: string[]) => {
        handleCommandExecution(src, name, args);
      },
      false
    );
    this.commands.set(name, {
      name: name,
      description,
      parameters,
      permissionLevel,
      handler,
    });
    this.refreshTimeout = setTimeout(() => this.refreshCommands(), 1000);
  }

  public getCommandInfo(name: string) {
    return this.commands.get(name);
  }
}

const commandManager = CommandManager.getInstance();
export default commandManager;
