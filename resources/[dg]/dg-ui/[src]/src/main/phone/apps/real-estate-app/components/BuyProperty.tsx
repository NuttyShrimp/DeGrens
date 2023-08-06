import { useEffect, useState } from 'react';
import { Button } from '@src/components/button';
import NumberFormat from '@src/components/numberformat';
import { Loader } from '@src/components/util';
import { nuiAction } from '@src/lib/nui-comms';
import { showCheckmarkModal, showLoadModal, showWarningModal } from '@src/main/phone/lib';

export const BuyProperty = () => {
  const [nearHouse, setNearHouse] = useState<Phone.RealEstate.BuyableProperty | null>();
  const fetchInfoForLocation = async () => {
    const info = await nuiAction<Phone.RealEstate.BuyableProperty>(
      'phone/realestate/nearBuyableHouse',
      {},
      {
        name: 'Oxford street 1',
        price: 4384694,
        owned: false,
      }
    );
    setNearHouse(info && info.name ? info : null);
  };

  const buyProperty = async () => {
    if (!nearHouse) return;
    showLoadModal();
    const success = await nuiAction('phone/realestate/buyProperty', {
      name: nearHouse.name,
    });
    if (!success || typeof success === 'string') {
      showWarningModal(undefined, typeof success === 'string' ? success : undefined);
    } else {
      showCheckmarkModal(() => {
        setNearHouse(null);
      });
    }
  };

  useEffect(() => {
    fetchInfoForLocation();
    const fetchInterval = setInterval(() => {
      fetchInfoForLocation();
    }, 5000);
    return () => {
      clearInterval(fetchInterval);
    };
  }, []);

  return (
    <div className='centered-container'>
      {nearHouse ? (
        <div className='realestate-app-buy-tab'>
          {nearHouse.name}
          <NumberFormat.Bank value={nearHouse.price} prefix='€' />
          {nearHouse.owned ? (
            <p>Already owned</p>
          ) : (
            <div className='center'>
              <Button.Primary onClick={() => buyProperty()}>Buy</Button.Primary>
            </div>
          )}
        </div>
      ) : (
        <div>
          <Loader />
          <div className='center' style={{ paddingTop: '3vh' }}>
            Searching nearby buyable house...
          </div>
        </div>
      )}
    </div>
  );
};
