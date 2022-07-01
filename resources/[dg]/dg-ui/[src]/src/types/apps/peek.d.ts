declare namespace Peek {
  interface Entry {
    id: string;
    label: string;
    icon: string;
  }

  interface State extends Base.State {
    hasTarget: boolean;
    showList: boolean;
    entries: Entry[];
  }
}
