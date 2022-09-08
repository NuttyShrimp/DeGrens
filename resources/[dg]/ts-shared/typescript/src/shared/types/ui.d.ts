declare namespace TaskBar {
  type Animation =
    | {
        animDict: string;
        anim: string;
        flags?: number;
      }
    | {
        task: string;
      };

  interface TaskBarSettings {
    canCancel?: boolean;
    cancelOnDeath?: boolean;
    cancelOnMove?: boolean;
    disarm?: boolean;
    disableInventory?: boolean;
    controlDisables?: {
      movement?: boolean;
      carMovement?: boolean;
      mouse?: boolean;
      combat?: boolean;
    };
    animation?: Animation;
    prop?: string;
  }
}

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
    id?: string;
    title: string;
    description?: string;
    /**
     * should be a fontawesome icon name as string or in name position (Minus the fas fa-) default lib is fas
     */
    icon?: string | Icon;
    /**
     * Event called on clicking, will also be triggered when subentries are defined
     */
    callbackURL?: string;
    disabled?: boolean;
    submenu?: Entry[];
    data?: any;
  }
}
