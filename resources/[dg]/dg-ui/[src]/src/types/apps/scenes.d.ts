declare namespace Scenes {
  type State = State.Base;

  interface Props extends State, State.BaseProps<State> {}
}
