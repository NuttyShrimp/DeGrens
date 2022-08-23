declare namespace Penalty {
  interface ClassConfig {
    length: number;
    points: number;
  }

  interface Config {
    classes: Record<string, ClassConfig>;
    reasons: Record<string, string>;
  }

  interface IncomingData {
    type: 'kick' | 'ban' | 'warn';
    target: string;
    reason: string;
    points: number;
    length?: number;
  }
}
