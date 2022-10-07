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
}
