declare namespace SimpleForm {
  interface FormElement {
    name: string;
    render: ({ onChange, value, name, required, error, autoFocus, setError }) => React.ReactElement<any, any>;
    defaultValue?: any;
    required?: boolean;
  }

  interface Form {
    header?: string;
    elements: FormElement[];
    onAccept: (data: any) => void | Promise<void>;
    onDecline?: () => void | Promise<void>;
  }
}
