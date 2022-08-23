import { Config, Util } from '@dgx/server';

class PenaltyInfoManager extends Util.Singleton<PenaltyInfoManager>() {
  private classes: Map<string, Penalty.ClassConfig>;
  private reasons: Map<string, string>;

  constructor() {
    super();
    this.classes = new Map();
    this.reasons = new Map();
    setImmediate(async () => {
      await Config.awaitConfigLoad();
      const banConfig = Config.getConfigValue<Penalty.Config>('admin.bans');
      if (!banConfig) return;
      this.setInfo(banConfig.classes, banConfig.reasons);
    });
  }

  getInfo() {
    // Back to records
    const classes: Record<string, Penalty.ClassConfig> = {};
    this.classes.forEach((v, k) => {
      classes[k] = v;
    });
    const reasons: Record<string, string> = {};
    this.reasons.forEach((v, k) => {
      reasons[k] = v;
    });
    return { classes, reasons };
  }

  setInfo(classes: Record<string, Penalty.ClassConfig>, reasons: Record<string, string>) {
    Object.keys(classes).forEach(r => {
      this.classes.set(r, classes[r]);
    });
    Object.keys(reasons).forEach(r => {
      this.reasons.set(r, reasons[r]);
    });
  }
}

const penaltyInfoManager = PenaltyInfoManager.getInstance();
export default penaltyInfoManager;
