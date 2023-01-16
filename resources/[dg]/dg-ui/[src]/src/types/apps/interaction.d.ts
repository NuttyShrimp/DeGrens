declare namespace Interaction {
  interface State {
    show: boolean;
    text: string;
    type: 'error' | 'info' | 'success';
  }
}
