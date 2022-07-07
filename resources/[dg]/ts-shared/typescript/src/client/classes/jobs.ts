class Jobs {
  getCurrentJob(): { name: string | null; rank: number | null } {
    return global.exports['dg-jobs'].getCurrentJob();
  }
}

export default {
  Jobs: new Jobs(),
};
