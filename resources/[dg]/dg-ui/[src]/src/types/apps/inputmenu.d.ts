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

  interface State extends Base.State {
    inputs: Input[];
    callbackURL: string;
    header?: string;
  }
}
