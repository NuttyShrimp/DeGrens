declare namespace Gangs {
  type Gang = {
    name: string;
    label: string;
    owner: number;
  };

  type Member = {
    cid: number;
    hasPerms: boolean;
  };

  type Members = Map<Gangs.Member['cid'], Gangs.Member>;
}
