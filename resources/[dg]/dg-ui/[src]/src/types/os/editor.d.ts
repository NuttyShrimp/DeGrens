declare namespace Editor {
  interface Props {
    placeholder: string;
    defaultValue?: string;
    onChange: (value) => void;
    /**
     * @default false
     */
    readonly?: boolean;
  }
}
