declare namespace Whitelist {
  interface Entry {
    cid: number;
    // Character name
    name: string;
    job: string;
    // Index of rank array
    rank: number;
    // Bit mask of specializations
    speciality: number;
  }
  interface Config {
    grades: string[];
    specialities: string[];
    name: string;
    bankAccount?: string;
  }
  interface Info {
    grades: string[];
    specialities: Record<string, number>;
    name: string;
    bankAccount?: string;
  }
}