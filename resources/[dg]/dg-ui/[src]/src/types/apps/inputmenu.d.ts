declare namespace InputMenu {
  interface FreeInput {
    type: 'text' | 'number' | 'password';
    value?: string;
  }
  interface SelectInput {
    type: 'select';
    value?: string;
    options: {
      label: string;
      value: string;
    }[];
  }
  interface Text {
    type: 'display';
    value?: string;
    getEndpoint: string;
  }

  type Input = {
    label: string;
    name: string;
  } & (FreeInput | SelectInput | Text);

  type Data = {
    inputs: Input[];
    callbackURL: string;
    header: string;
  };

  type State = Base.State;
}
