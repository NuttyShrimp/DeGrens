declare namespace Sliders {
  interface State extends State.Base {
    power: number[];
    amount: number[];
  }

  interface Props extends State, State.BaseProps<State> {}
}
