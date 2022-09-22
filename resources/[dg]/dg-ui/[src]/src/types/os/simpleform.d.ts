declare namespace SimpleForm {
  interface FormElement {
    name: string;
    render: ({ onChange, value, name, required, error }) => React.ReactElement<any, any>;
    defaultValue?: string | boolean;
    required?: boolean;
  }

  interface Form {
    header?: string;
    elements: FormElement[];
    onAccept: (data: any) => void;
    onDecline?: () => void;
  }
}
