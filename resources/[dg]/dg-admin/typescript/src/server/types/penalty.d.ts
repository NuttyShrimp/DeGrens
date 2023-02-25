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
    reasons: string[];
    points: number;
    length?: number;
  }

  interface PenaltyReset {
    steamid: string;
    points: number;
    created_at: number;
    updated_at: number;
  }
}
