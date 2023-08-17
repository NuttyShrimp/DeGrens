import { FC, WheelEvent } from 'react';

import { useCarboostingAppStore } from '../stores/useCarboostingAppStore';

import { Contract } from './contract';

export const ContractList: FC = () => {
  const { contracts } = useCarboostingAppStore();

  const handleScroll = (e: WheelEvent<HTMLDivElement>) => {
    // e.preventDefault();
    e.currentTarget.scrollLeft += e.deltaY;
  };

  return (
    <div className='laptop-carboosting-contract-list' onWheel={handleScroll}>
      {contracts.map(c => (
        <Contract key={`carboosting_contract_${c.id}`} {...c} />
      ))}
    </div>
  );
};
