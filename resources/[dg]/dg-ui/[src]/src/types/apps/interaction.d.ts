declare namespace Interaction {
  interface State extends Base.State {
    show: boolean;
    text: string;
    type: 'error' | 'info' | 'success';
  }
}
