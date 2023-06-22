declare namespace Business {
  interface Type {
    id: number;
    name: string;
    permissions: string[];
  }

  interface Info {
    id: number;
    name: string;
    label: string;
    business_type: Type;
    bank_account_id: string;
  }

  interface Role {
    id: number;
    name: string;
    // Bitmask of available permissions
    permissions: number;
  }

  interface Employee {
    id: number;
    name: string;
    isOwner: boolean;
    citizenid: number;
    role: number;
    bank: IFinancials.Permissions;
  }

  interface Log {
    id: number;
    citizenid: number;
    type: string;
    action: string;
  }

  namespace UI {
    interface Business {
      id: number;
      name: string;
      label: string;
      role: string;
      // My permissions
      permissions: string[];
      allPermissions: string[];
    }

    type Employee = Omit<Business.Employee, 'id' | 'role'> & { role: string };

    interface Log {
      id: number;
      // Name behind citizenid from DB
      name: string;
      type: string;
      action: string;
    }
  }

  type BusinessConfig = {
    businessZone: Zones.Box | Zones.Poly; // Zone of business
    managementZone: Zones.Box | Zones.Circle; // Zone to access duty options, lockers, etc
    // Optional blip for business
    blip?: {
      sprite: number;
      color: number;
      coords: Vec3;
    };
    // Optional registers for business to handle payments by filling in amount (if itemPrices defined, inputmenu will be repliced by making an order out of those items)
    registers?: {
      employeePercentage: number;
      zones: (Zones.Box | Zones.Circle)[];
    };
    // Optional stash for business for all employees
    stashZone?: Zones.Box | Zones.Circle;
    // Optional shop zone where players can buy stuff if no employees are signed in. Employees can fill stock. If stock is present money goes to business and item gets removed from stock. If no stock present, item gets created but money goes to state
    shopZone?: Zones.Box | Zones.Circle;
    // Optional crafting zone where signed in players can access bench with provided id
    crafting?: {
      benchId: string;
      zone: Zones.Box | Zones.Circle;
    };
    // Optional items that can be priced by business employees
    priceItems?: string[];
    // These peek zones get build when entering businessZone, to be used in other resources
    extraZones?: {
      name: string;
      isTarget: boolean;
      zone: Zones.Box | Zones.Circle | Zones.Poly;
      data?: Record<string, any>;
    }[];
    // Optional extra config for business to be used in other resources/specific module
    extraConfig?: Record<string, any>;
  };

  type BusinessTypeConfig = {
    permissions: string[];
    // if property is defined for type, we opt in to use onduty system
    signin?: {
      signOutWhenLeavingZone: boolean;
    };
    // if property is defined for type, we opt in to have lockers for employees
    lockers?: {
      size: number;
    };
    paycheck: {
      amount: number; // amount per paycheck
      time: number; // time in seconds between paychecks
    };
  };

  type ClientPricedItems = Record<
    string,
    {
      label: string;
      price: number;
    }
  >;
}
