declare namespace ContextMenu {
  interface Icon {
    name: string;
    color?: string;
    lib?: 'fas' | 'far' | 'fal' | 'fab' | 'fad' | 'fad';
    position?: 'left' | 'right';
  }

  interface Entry {
    /**
     * Unique identifier, can be reused in subentries
     */
    id: string;
    title: string;
    description?: string;
    /**
     * should be a fontawesome icon name as string or in name position (Minus the fas fa-) default lib is fas
     */
    icon?: string | Icon;
    /**
     * Event called upo on clicking, will also be triggered when subentries are defined
     */
    callbackURL?: string;
    disabled?: boolean;
    submenu?: Entry[];
    data?: any;
    preventCloseOnClick?: boolean;
  }

  interface State {
    entries: Entry[];
    allEntries: Entry[];
    /**
     * Index in entries list
     */
    parentEntry: string[];
  }

  interface StateActions {
    resetEntries: () => void;
    loadEntries: (data: Entry[]) => void;
    setEntries: (ent: Entry[], parent: string[]) => void;
  }
}
