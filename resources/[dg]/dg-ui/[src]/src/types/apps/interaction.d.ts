declare namespace Interaction {
  interface State extends State.Base {
    show: boolean;
    text: string;
    type: 'error' | 'info' | 'success';
  }
  interface Props extends State, State.BaseProps<State> {}
}
