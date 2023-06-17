import { useMainStore } from '@src/lib/stores/useMainStore';

import { useHudStore } from '../stores/useHudStore';

export const Compass = () => {
  const gameTime = useMainStore(s => s.game.time);
  const { area, heading, street1, street2, visible } = useHudStore(s => s.compass);
  if (!visible) return null;
  return (
    <div className='hud-compass-wrapper'>
      <div className='hud-compass-area'>{area}</div>
      <div className='hud-compass-plate'>
        <div className='hud-compass-pointer'>
          <i className='fas fa-caret-down' />
        </div>
        <svg className='hud-compass-bezel' viewBox={`${heading - 133} 0 270 25`}>
          <rect width='3' stroke='black' fill='white' strokeWidth='0.5' strokeOpacity='0.6' height='20' x='-135' />
          <rect width='4.5' stroke='black' fill='white' strokeWidth='0.5' strokeOpacity='0.6' height='20' x='-90' />
          <rect width='3' stroke='black' fill='white' strokeWidth='0.5' strokeOpacity='0.6' height='9' x='-45' />
          <rect width='4.5' stroke='black' fill='white' strokeWidth='0.5' strokeOpacity='0.6' height='20' x='0' />
          <rect width='3' stroke='black' fill='white' strokeWidth='0.5' strokeOpacity='0.6' height='9' x='45' />
          <rect width='4.5' stroke='black' fill='white' strokeWidth='0.5' strokeOpacity='0.6' height='20' x='90' />
          <rect width='3' stroke='black' fill='white' strokeWidth='0.5' strokeOpacity='0.6' height='9' x='135' />
          <rect width='4.5' stroke='black' fill='white' strokeWidth='0.5' strokeOpacity='0.6' height='20' x='180' />
          <rect width='3' stroke='black' fill='white' strokeWidth='0.5' strokeOpacity='0.6' height='9' x='225' />
          <rect width='4.5' stroke='black' fill='white' strokeWidth='0.5' strokeOpacity='0.6' height='20' x='270' />
          <rect width='3' stroke='black' fill='white' strokeWidth='0.5' strokeOpacity='0.6' height='9' x='315' />
          <rect width='4.5' stroke='black' fill='white' strokeWidth='0.5' strokeOpacity='0.6' height='20' x='360' />
          <rect width='3' stroke='black' fill='white' strokeWidth='0.5' strokeOpacity='0.6' height='9' x='405' />
          <rect width='4.5' stroke='black' fill='white' strokeWidth='0.5' strokeOpacity='0.6' height='20' x='450' />
          <rect width='3' stroke='black' fill='white' strokeWidth='0.5' strokeOpacity='0.6' height='9' x='495' />
        </svg>

        <svg className='hud-compass-bearing' viewBox={`${heading - 135} 0 270 10`}>
          <text x='-135' y='-11' dominantBaseline='middle' textAnchor='middle' className='hud-compass-bearing-small'>
            SW
          </text>
          <text x='-90' y='1.5' dominantBaseline='middle' textAnchor='middle'>
            W
          </text>
          <text x='-45' y='-11' dominantBaseline='middle' textAnchor='middle' className='hud-compass-bearing-small'>
            NW
          </text>
          <text x='0' y='1.5' dominantBaseline='middle' textAnchor='middle'>
            N
          </text>
          <text x='45' y='-11' dominantBaseline='middle' textAnchor='middle' className='hud-compass-bearing-small'>
            NE
          </text>
          <text x='90' y='1.5' dominantBaseline='middle' textAnchor='middle'>
            E
          </text>
          <text x='135' y='-11' dominantBaseline='middle' textAnchor='middle' className='hud-compass-bearing-small'>
            SE
          </text>
          <text x='180' y='1.5' dominantBaseline='middle' textAnchor='middle'>
            S
          </text>
          <text x='225' y='-11' dominantBaseline='middle' textAnchor='middle' className='hud-compass-bearing-small'>
            SW
          </text>
          <text x='270' y='1.5' dominantBaseline='middle' textAnchor='middle'>
            W
          </text>
          <text x='315' y='-11' dominantBaseline='middle' textAnchor='middle' className='hud-compass-bearing-small'>
            NW
          </text>
          <text x='360' y='1.5' dominantBaseline='middle' textAnchor='middle'>
            N
          </text>
          <text x='405' y='-11' dominantBaseline='middle' textAnchor='middle' className='hud-compass-bearing-small'>
            NE
          </text>
          <text x='450' y='1.5' dominantBaseline='middle' textAnchor='middle'>
            E
          </text>
          <text x='495' y='-11' dominantBaseline='middle' textAnchor='middle' className='hud-compass-bearing-small'>
            SE
          </text>
        </svg>
        <div className='hud-compass-time'>{gameTime}</div>
      </div>
      <div className='hud-compass-street'>
        {street1}
        {street2 !== '' && <span> [{street2}]</span>}
      </div>
    </div>
  );
};
