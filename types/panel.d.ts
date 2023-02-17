declare namespace Panel {
  namespace Auth {
    type Info = {
      endpoint: string;
      token: string;
      steamId: string;
    };
  }
  type Tag = {
    name: string;
    color: string;
  };
  type Member = {
    steamId: string;
    name: string;
  };
  type Report = {
    id: number;
    title: string;
    open: boolean;
    /**
     * ISO-formatted date string
     */
    createdAt: string;
    /**
     * ISO-formatted date string
     */
    updatedAt: string;
    members?: Member[];
    tags?: Tag[];
  };
  type Message = {
    id: number;
    message: string;
    type: 'text' | 'image';
    createdAt: string;
    updatedAt: string;
    deletedAt: null;
    sender: MessageSender;
  };
  type MessageSender = {
    username: string;
    avatarUrl: string;
    roles: string[];
    steamId?: string;
  };

  type NewReport = {
    title: string;
    message: Object;
  };
}
