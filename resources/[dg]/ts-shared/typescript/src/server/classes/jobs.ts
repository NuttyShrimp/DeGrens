class Jobs {
  createGroup(src: number): boolean {
    return global.exports['dg-jobs'].createGroup(src);
  }
  getGroupByServerId(id: number): Jobs.Groups.Group | undefined {
    return global.exports['dg-jobs'].getGroupByServerId(id);
  }
  getGroupByCid(cid: number): Jobs.Groups.Group | undefined {
    return global.exports['dg-jobs'].getGroupByCid(cid);
  }
  changeJob(src: number, job: string): Promise<boolean> {
    return global.exports['dg-jobs'].changeJob(src, job);
  }
}

export default {
  Jobs: new Jobs(),
};
