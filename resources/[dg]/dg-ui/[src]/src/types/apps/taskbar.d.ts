declare namespace TaskBar {
  interface State extends State.Base {
    duration: number;
    label: string;
    id: string;
  }
  interface Props extends State, State.BaseProps<State> {}
}
