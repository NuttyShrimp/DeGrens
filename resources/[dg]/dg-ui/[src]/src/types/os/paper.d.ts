declare namespace Paper {
  interface Props {
    actions?: Action[];
    notification?: boolean;
    className?: string;
    onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
    title?: string | React.ReactNode;
    description?: string | React.ReactNode;
    extDescription?: string | React.ReactNode;
    image?: string | React.ReactNode;
    /**
     * @default false
     * @description If true, the description will be replaced with the extended description otherwise it will be added under it.
     */
    replaceDescription?: boolean;
  }
}
