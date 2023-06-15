declare namespace Gangs {
  type Gang = {
    name: string;
    label: string;
    owner: number;
  };

  type Data = {
    name: string;
    label: string;
    owner: number;
    members: {
      name: string;
      cid: number;
      hasPerms: boolean;
    }[];
    feedMessages: Feed.Message[]; // ONLY NEWEST 10 get provided
  };

  type Member = {
    cid: number;
    hasPerms: boolean;
  };

  type Members = Map<Gangs.Member['cid'], Gangs.Member>;

  namespace Feed {
    type Message = {
      id: number;
      gang: string | null;
      title: string;
      content: string;
      date: number;
    };

    type NewMessage = Pick<Message, 'content' | 'title'> & { gang?: string };
  }
}
