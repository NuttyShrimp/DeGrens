declare namespace NBusiness {
  interface Business {
    info: Info;
    roles: Role[];
    employees: Employee[];
  }

  interface Type {
    id: number;
    name: string;
    permissions: string[];
  }

  interface Role {
    id: number;
    name: string;
    permission: number;
  }

  interface Employee {
    id: number;
    name: string;
    isOwner: boolean;
    citizenid: number;
    // represent role id
    role: number;
    bank: IFinancials.Permissions;
  }

  interface Info {
    id: number;
    name: string;
    label: string;
    business_type: Type;
    bank_account_id: string;
  }
}
