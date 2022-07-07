declare namespace Whitelist {
  interface Entry {
    cid: number;
    // Character name
    name: string;
    job: string;
    // Index of rank array
    rank: number;
    // Bit mask of specializations
    specialty: number;
  }
  interface Config {
    grades: string[];
    specialties: string[];
    name: string;
  }
  interface Info {
    grades: string[];
    specialties: Record<string, number>;
    name: string;
  }
}
