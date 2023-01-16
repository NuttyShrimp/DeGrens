declare namespace Keygame {
  type Open = {
    id: string;
    cycles: Cycle[];
  };

  type Direction = 'up' | 'down' | 'left' | 'right';

  type Target = {
    start: number;
    end: number;
  };

  type ArrowColor = 'normal' | 'success' | 'fail';

  type Cycle = {
    speed: number;
    size: number;
  };
}
