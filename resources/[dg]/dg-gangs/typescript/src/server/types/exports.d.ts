declare interface ServerExports {
  gangs: {
    createGang: (name: string, label: string, owner: number) => Promise<boolean>;
    removeGang: (name: string) => Promise<boolean>;
    addMemberToGang: (adminServerId: number, gangName: string, targetCid: number) => Promise<boolean>;
    addFeedMessage: (newMessage: Gangs.Feed.NewMessage) => Promise<void>;
  };
}
