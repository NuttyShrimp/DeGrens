declare interface ServerExports {
  carboosting: {
    createContract: (model: string, owner?: number) => void;
    adminCancelBoost: (cid: number) => void;
  };
}
