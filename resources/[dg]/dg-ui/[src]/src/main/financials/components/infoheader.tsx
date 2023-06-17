import { NumberFormat } from '../../../components/numberformat';
import { useFinancialsStore } from '../stores/useFinancialsStore';

export const Infoheader = () => {
  const [bank, cash] = useFinancialsStore(s => [s.bank, s.cash]);
  return (
    <div className={'financials__header'}>
      <div>
        <i className={'fas fa-university'} />
        <span>{` ${bank.charAt(0).toUpperCase()}${bank.slice(1)}`}</span>
      </div>
      <div>
        <span>
          cash: €<NumberFormat.Bank value={cash} />
        </span>
      </div>
    </div>
  );
};
