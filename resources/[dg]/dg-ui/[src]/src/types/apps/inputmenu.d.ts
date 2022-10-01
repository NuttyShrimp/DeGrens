declare namespace InputMenu {
  type Input = {
    label: string;
    name: string;
  } & (
    | {
        type: 'text' | 'number' | 'password';
        value?: string;
      }
    | {
        type: 'select';
        value?: string;
        options: {
          label: string;
          value: string;
        }[];
      }
  );

  type Data = {
    inputs: Input[];
    callbackURL: string;
    header: string;
  };

  type State = Base.State;
}
