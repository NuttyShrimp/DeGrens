declare namespace InputMenu {
  type inputType = 'text' | 'number' | 'password' | 'select';

  interface Input {
    type: inputType;
    name: string;
    label: string;
    value: string;
    options?: {
      label: string;
      value: string;
    }[];
  }

  interface State extends State.Base {
    inputs: Input[];
    callbackURL: string;
    header?: string;
  }

  interface Props extends State, State.BaseProps {}
}
