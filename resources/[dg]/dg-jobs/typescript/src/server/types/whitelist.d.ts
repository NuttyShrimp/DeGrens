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
  type Config = {
    grades: string[];
    specialities: string[];
    name: string;
    bankAccount?: string;
    blockJoiningGroup?: boolean;
  };

  type Info = Omit<Config, 'specialities'> & {
    specialities: Record<string, number>;
  };
}
